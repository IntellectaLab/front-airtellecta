import type { Meta, StoryObj } from '@storybook/react-vite'
import { FormInput } from '../components/FormInput/FormInput'

const meta = {
  title: 'Components/FormInput',
  component: FormInput,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    label:       { control: 'text' },
    placeholder: { control: 'text' },
    value:       { control: 'text' },
    error:       { control: 'text' },
    type:        { control: { type: 'select' }, options: ['text', 'email', 'number'] },
  },
} satisfies Meta<typeof FormInput>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { label: 'Correo electrónico', placeholder: 'usuario@tec.mx' },
}

export const WithValue: Story = {
  args: { label: 'Nombre', value: 'Eduardo Abundiz', placeholder: 'Ingresa tu nombre' },
}

export const WithError: Story = {
  args: {
    label:       'Correo electrónico',
    placeholder: 'usuario@tec.mx',
    error:       'El campo es requerido.',
  },
}

export const NumberType: Story = {
  args: { label: 'Horizonte (años)', placeholder: '10', type: 'number' },
}
