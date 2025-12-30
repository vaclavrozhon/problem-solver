import { Icon } from "@iconify/react"
import { Provider, provider_details } from "@shared/types/research"

import ZAILogo from "@frontend/components/svg/logos/ZAI"
import XAILogo from "@frontend/components/svg/logos/XAI"
import MoonshotLogo from "@frontend/components/svg/logos/Moonshot"

const custom_logos: Record<string, React.FC<{ size?: number }>> = {
  moonshotai: MoonshotLogo,
  xai: XAILogo,
  zai: ZAILogo,
}

interface ProviderLogoProps {
  model_id: string
  size?: number
}

export default function ProviderLogo({ model_id, size = 16 }: ProviderLogoProps) {
  const provider = model_id.split("/")[0]
    .replaceAll("-", "") // to handle x-ai et cetera

  if (provider in custom_logos) {
    const CustomLogo = custom_logos[provider]
    return <CustomLogo size={size}/>
  }

  if (provider in provider_details) {
    const logo = provider_details[provider as Provider].logo
    if (logo) return <Icon icon={logo} width={size} height={size}/>
  }

  return null
}
