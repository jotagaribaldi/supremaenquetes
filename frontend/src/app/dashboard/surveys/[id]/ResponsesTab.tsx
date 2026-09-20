'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { responseApi } from '@/lib/api';
import { Response } from '@/types';
import { Loader2, AlertCircle, CheckCircle, XCircle, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface ResponsesTabProps {
  surveyId: string;
}

export function ResponsesTab({ surveyId }: ResponsesTabProps) {
  const [responses, setResponses] = useState<Response[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showInvalid, setShowInvalid] = useState(false);
  const pageSize = 10;

  useEffect(() => {
    loadResponses();
  }, [surveyId, page, showInvalid]);

  const loadResponses = async () => {
    setLoading(true);
    try {
      const res = await responseApi.listBySurvey(surveyId, showInvalid);
      const allResponses = res.data;
      setTotalPages(Math.ceil(allResponses.length / pageSize));
      const start = (page - 1) * pageSize;
      setResponses(allResponses.slice(start, start + pageSize));
    } catch (error) {
      console.error('Erro ao carregar respostas:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    true: 'bg-green-100 text-green-800',
    false: 'bg-red-100 text-red-800',
  };

  const ValidIcon = CheckCircle;
  const InvalidIcon = XCircle;

  if (loading) {
    return React.createElement(
      Card,
      null,
      React.createElement(
        CardContent,
        { className: 'py-8' },
        React.createElement(
          'div',
          { className: 'space-y-4' },
          [1, 2, 3, 4, 5].map((i) =>
            React.createElement('div', { key: i, className: 'h-16 animate-pulse bg-gray-100 rounded' })
          )
        )
      )
    );
  }

  return React.createElement(
    'div',
    { className: 'space-y-4' },
    React.createElement(
      'div',
      { className: 'flex items-center justify-between' },
      React.createElement(
        'div',
        { className: 'flex items-center space-x-4' },
        React.createElement(
          'label',
          { className: 'flex items-center space-x-2 cursor-pointer' },
          React.createElement('input', {
            type: 'checkbox',
            checked: showInvalid,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => setShowInvalid(e.target.checked),
            className: 'h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500',
          }),
          React.createElement('span', { className: 'text-sm text-gray-700' }, 'Mostrar inválidas')
        )
      )
    ),
    React.createElement(
      Card,
      null,
      React.createElement(
        CardContent,
        { className: 'p-0' },
        React.createElement(
          'div',
          { className: 'overflow-x-auto' },
          React.createElement(
            'table',
            { className: 'w-full' },
            React.createElement(
              'thead',
              null,
              React.createElement(
                'tr',
                { className: 'border-b border-gray-200 bg-gray-50' },
                ['Data', 'Cidade', 'Sexo', 'Idade', 'Escolaridade', 'IP', 'Status'].map((header) =>
                  React.createElement(
                    'th',
                    { key: header, className: 'px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider' },
                    header
                  )
                )
              )
            ),
            React.createElement(
              'tbody',
              { className: 'divide-y divide-gray-200' },
              responses.length === 0 ? (
                React.createElement(
                  'tr',
                  null,
                  React.createElement(
                    'td',
                    { colSpan: 7, className: 'px-4 py-8 text-center text-gray-500' },
                    'Nenhuma resposta encontrada'
                  )
                )
              ) : (
                responses.map((response) =>
                  React.createElement(
                    'tr',
                    { key: response.id, className: 'hover:bg-gray-50' },
                    React.createElement('td', { className: 'px-4 py-3 text-sm text-gray-900' }, format(new Date(response.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })),
                    React.createElement('td', { className: 'px-4 py-3 text-sm text-gray-900' }, response.city),
                    React.createElement('td', { className: 'px-4 py-3 text-sm text-gray-900' }, response.gender),
                    React.createElement('td', { className: 'px-4 py-3 text-sm text-gray-900' }, response.ageRange),
                    React.createElement('td', { className: 'px-4 py-3 text-sm text-gray-900' }, response.education),
                    React.createElement('td', { className: 'px-4 py-3 text-sm text-gray-900 font-mono' }, response.ipAddress),
                    React.createElement(
                      'td',
                      { className: 'px-4 py-3' },
                      React.createElement(
                        'span',
                        {
                          className: cn(
                            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                            statusColors[response.isValid ? 'true' : 'false'],
                          ),
                        },
                        React.createElement(response.isValid ? ValidIcon : InvalidIcon, { className: 'h-3 w-3 mr-1' }),
                        response.isValid ? 'Válida' : 'Inválida'
                      )
                    )
                  )
                )
              )
            )
          )
        )
      )
    ),
    totalPages > 1 && React.createElement(
      'div',
      { className: 'flex items-center justify-center space-x-2' },
      React.createElement(
        'button',
        {
          onClick: () => setPage((p: number) => Math.max(1, p - 1)),
          disabled: page === 1,
          className: 'p-2 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50',
        },
        React.createElement(ChevronLeft, { className: 'h-4 w-4' })
      ),
      React.createElement('span', { className: 'text-sm text-gray-700' }, `Página ${page} de ${totalPages}`),
      React.createElement(
        'button',
        {
          onClick: () => setPage((p: number) => Math.min(totalPages, p + 1)),
          disabled: page === totalPages,
          className: 'p-2 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50',
        },
        React.createElement(ChevronRight, { className: 'h-4 w-4' })
      )
    )
  );
}