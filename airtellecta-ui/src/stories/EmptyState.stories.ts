import type { Meta, StoryObj } from '@storybook/react-vite'
import { EmptyState } from '../components/EmptyState/EmptyState'

const meta = {
  title: 'Components/EmptyState',
  component: EmptyState,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    title:       { control: 'text' },
    description: { control: 'text' },
  },
} satisfies Meta<typeof EmptyState>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title:       'Sin datos disponibles',
    description: 'No hay registros para mostrar en este periodo.',
  },
}

export const MapaVacio: Story = {
  args: {
    title:       'Mapa sin información',
    description: 'Selecciona otro filtro para ver datos estatales.',
  },
}

export const Alertas: Story = {
  args: {
    title:       'Sin alertas activas',
    description: 'El sistema no ha detectado alertas en los últimos 30 días.',
  },
}
