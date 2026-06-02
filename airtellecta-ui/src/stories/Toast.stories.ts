import type { Meta, StoryObj } from '@storybook/react-vite'
import { Toast } from '../components/Toast/Toast'

const meta = {
  title: 'Components/Toast',
  component: Toast,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    message: { control: 'text' },
    type:    { control: { type: 'radio' }, options: ['success', 'error'] },
  },
} satisfies Meta<typeof Toast>

export default meta
type Story = StoryObj<typeof meta>

export const Success: Story = {
  args: { message: 'Usuario creado correctamente.', type: 'success' },
}

export const Error: Story = {
  args: { message: 'Ocurrió un error al guardar los cambios.', type: 'error' },
}

export const SuccessLong: Story = {
  args: {
    message: 'La exportación del panel ejecutivo se completó exitosamente.',
    type: 'success',
  },
}
