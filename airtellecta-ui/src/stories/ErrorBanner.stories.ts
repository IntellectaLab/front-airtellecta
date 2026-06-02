import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { ErrorBanner } from '../components/ErrorBanner/ErrorBanner'

const meta = {
  title: 'Components/ErrorBanner',
  component: ErrorBanner,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  argTypes: {
    message:     { control: 'text' },
    actionLabel: { control: 'text' },
    onAction:    { action: 'action clicked' },
  },
  args: { onAction: fn() },
} satisfies Meta<typeof ErrorBanner>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { message: 'No se pudo cargar el resumen nacional.' },
}

export const WithAction: Story = {
  args: {
    message:     'Error al conectar con el servidor.',
    actionLabel: 'Reintentar',
  },
}

export const LongMessage: Story = {
  args: {
    message:     'Ocurrió un error al exportar el reporte. Verifica tu conexión e intenta de nuevo.',
    actionLabel: 'Reintentar',
  },
}
