import type { Meta, StoryObj } from '@storybook/react-vite'
import { PasswordInput } from '../components/PasswordInput/PasswordInput'

const meta = {
  title: 'Components/PasswordInput',
  component: PasswordInput,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    label:       { control: 'text' },
    placeholder: { control: 'text' },
    error:       { control: 'text' },
  },
} satisfies Meta<typeof PasswordInput>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { label: 'Contraseña' },
}

export const CustomPlaceholder: Story = {
  args: { label: 'Contraseña', placeholder: 'Mínimo 8 caracteres' },
}

export const WithError: Story = {
  args: { label: 'Contraseña', error: 'La contraseña es incorrecta.' },
}
