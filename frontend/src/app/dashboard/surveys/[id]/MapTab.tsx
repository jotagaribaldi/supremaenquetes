'use client';

import { useEffect, useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { dashboardApi } from '@/lib/api';
import { GeoPoint } from '@/types';
import { Loader2, MapPin, AlertCircle, CheckCircle } from 'lucide-react';

interface MapTabProps {
  surveyId: string;
}

export function MapTab({ surveyId }: MapTabProps) {
  const [geoData, setGeoData] = useState<GeoPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState<[number, number]>([-15.7801, -47.9292]);
  const [zoom, setZoom] = useState(4);
  const [isClient, setIsClient] = useState(false);
  const [MapComponents, setMapComponents] = useState<{
    MapContainer: any;
    TileLayer: any;
    Marker: any;
    Popup: any;
    Circle: any;
  } | null>(null);
  const iconsRef = useRef<{ DefaultIcon: any; ValidIcon: any; InvalidIcon: any } | null>(null);

  const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
  const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
  const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

  useEffect(() => {
    setIsClient(true);
    // Dynamically import leaflet and react-leaflet only on client side
    Promise.all([
      import('leaflet'),
      import('react-leaflet'),
    ]).then(([LModule, RLModule]) => {
      // Inject leaflet CSS dynamically
      if (typeof document !== 'undefined' && !document.querySelector('link[href*="leaflet.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        link.crossOrigin = '';
        document.head.appendChild(link);
      }
      const L = LModule.default || LModule;
      const { MapContainer, TileLayer, Marker, Popup, Circle } = RLModule;

      const DefaultIcon = L.icon({
        iconRetinaUrl,
        iconUrl,
        shadowUrl,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      const ValidIcon = L.icon({
        ...DefaultIcon.options,
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
      });

      const InvalidIcon = L.icon({
        ...DefaultIcon.options,
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
      });

      iconsRef.current = { DefaultIcon, ValidIcon, InvalidIcon };
      setMapComponents({ MapContainer, TileLayer, Marker, Popup, Circle });
    });
  }, []);

  useEffect(() => {
    loadGeoData();
  }, [surveyId]);

  const loadGeoData = async () => {
    try {
      const res = await dashboardApi.getGeo(surveyId);
      const data = res.data;
      setGeoData(data);
      if (data.length > 0) {
        const avgLat = data.reduce((acc: number, p: GeoPoint) => acc + p.lat, 0) / data.length;
        const avgLng = data.reduce((acc: number, p: GeoPoint) => acc + p.lng, 0) / data.length;
        setMapCenter([avgLat, avgLng]);
        setZoom(data.length > 10 ? 8 : 12);
      }
    } catch (error) {
      console.error('Erro ao carregar dados geográficos:', error);
    } finally {
      setLoading(false);
    }
  };

  const validPoints = geoData.filter((_, i) => {
    const point = geoData[i];
    return geoData.findIndex(p => p.lat === point.lat && p.lng === point.lng) === i;
  });

  if (loading || !isClient || !MapComponents) {
    return (
      <Card>
        <CardContent className="h-96 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </CardContent>
      </Card>
    );
  }

  if (geoData.length === 0) {
    return (
      <Card>
        <CardContent className="h-96 flex flex-col items-center justify-center text-center">
          <MapPin className="h-12 w-12 text-gray-300" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">Nenhum dado geográfico</h3>
          <p className="mt-2 text-gray-500">Respostas válidas com geolocalização aparecerão aqui</p>
        </CardContent>
      </Card>
    );
  }

  const { MapContainer, TileLayer, Marker, Popup, Circle } = MapComponents;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <span>Mapa de Respostas</span>
            </CardTitle>
            <CardDescription>
              {geoData.length} resposta(s) válida(s) georreferenciada(s)
            </CardDescription>
          </div>
          <div className="flex items-center space-x-4 text-sm">
            <span className="flex items-center space-x-1 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span>Válidas</span>
            </span>
            <span className="flex items-center space-x-1 text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span>Inválidas (não mostradas)</span>
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-96">
          <MapContainer
            center={mapCenter}
            zoom={zoom}
            scrollWheelZoom={true}
            className="h-full w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {geoData.map((point, index) => (
              <Marker
                key={index}
                position={[point.lat, point.lng]}
                icon={iconsRef.current?.ValidIcon}
              >
                <Popup>
                  <div>
                    <p className="font-medium">{point.city}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(point.date).toLocaleString('pt-BR')}
                    </p>
                    <p className="text-xs text-gray-400">
                      {point.lat.toFixed(6)}, {point.lng.toFixed(6)}
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))}
            {geoData.map((point, index) => (
              <Circle
                key={`circle-${index}`}
                center={[point.lat, point.lng]}
                radius={25}
                color="#ef4444"
                fillColor="#ef4444"
                fillOpacity={0.1}
                opacity={0.5}
                weight={1}
              />
            ))}
          </MapContainer>
        </div>
      </CardContent>
    </Card>
  );
}