import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { PrimaryButton } from '../components/PrimaryButton/PrimaryButton'

const meta = {
  title: 'Components/PrimaryButton',
  component: PrimaryButton,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    label:    { control: 'text' },
    disabled: { control: 'boolean' },
    onClick:  { action: 'clicked' },
  },
  args: { onClick: fn() },
} satisfies Meta<typeof PrimaryButton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { label: 'Acceder al Sistema' },
}

export const Disabled: Story = {
  args: { label: 'Verificando...', disabled: true },
}

export const ShortLabel: Story = {
  args: { label: 'Guardar' },
}
