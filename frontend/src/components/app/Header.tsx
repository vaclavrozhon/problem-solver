import { Dropdown, Label, Header as DropdownHeader, Separator } from "@heroui/react"
import { useNavigate, RegisteredRouter, ValidateToPath, Link } from "@tanstack/react-router"
import { Icon } from "@iconify/react"

import Logo from "../svg/Logo"
import TextLogo from "../svg/TextLogo"

type HeaderProps = {
  is_authenticated: boolean
  is_admin: boolean
}

export default function Header({ is_authenticated, is_admin }: HeaderProps) {
  const chip = "rounded-full py-1 px-3 text-sm font-semibold"
  const link_chip = `
    ${chip} bg-beta
    hover:text-ink-2
    [&.active]:bg-brand/20 [&.active]:text-ink-2
  `
  const header = "flex items-center justify-between gap-4 px-4 py-2.5"

  if (!is_authenticated) return (
    <header className={header}>
      <Link to="/"
        preload="intent"
        className="flex items-center gap-2">
        <Logo/>
        <TextLogo/>
      </Link>
    </header>
  )

  return (
    <header className={header}>
      <Link to="/"
        preload="intent"
        className="flex items-center gap-2">
        <Logo/>
        <TextLogo/>
      </Link>
      <nav>
        <Link to="/"
          preload="intent"
          className={link_chip}>
          My Problems
        </Link>
        <Link to="/create"
          preload="intent"
          className={link_chip}>
          Create Problem
        </Link>
        <Link to="/usage"
          preload="intent"
          className={link_chip}>
          Usage
        </Link>
        <Link to="/settings"
          preload="intent"
          className={link_chip}>
          Settings
        </Link>

        {is_admin && (
          <Dropdown>
            <Dropdown.Trigger className={`
              ${chip} bg-brand text-alpha
              hover:cursor-pointer
            `}>
              Admin
            </Dropdown.Trigger>
            <Dropdown.Popover className="min-w-40">
              <Dropdown.Menu>
                <Dropdown.Section>
                  <DropdownHeader>Problems</DropdownHeader>
                  <DropdownLink to="/admin/archive"
                    icon="gravity-ui:archive">
                    Archive
                  </DropdownLink>
                  <DropdownLink to="/admin/jobs"
                    icon="gravity-ui:chart-bar-stacked">
                    Job Queue
                  </DropdownLink>
                </Dropdown.Section>

                <Dropdown.Section>
                  <DropdownHeader>User</DropdownHeader>
                  <DropdownLink to="/admin/users"
                    icon="gravity-ui:persons">
                    Users
                  </DropdownLink>
                  <DropdownLink to="/admin/invites"
                    icon="gravity-ui:envelope">
                    Invites
                  </DropdownLink>
                </Dropdown.Section>

                <Separator/>

                <Dropdown.Item className="w-full flex items-center justify-between"
                  href="https://docs.google.com/document/d/1WS9RQYO7gGlbYph6ZW0xk-Nr6NcUz78mzzjY_l0ulAo/edit?usp=sharing"
                  target="_blank">
                  Shared Notes
                  <Icon icon="gravity-ui:arrow-up-right-from-square"/>
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown>
        )}
      </nav>
    </header>
  )
}

interface DropdownLinkProps {
  to: ValidateToPath<RegisteredRouter>,
  icon: string,
  children: React.ReactNode,
}

function DropdownLink({ to, icon, children }: DropdownLinkProps) {
  const navigate = useNavigate()
  return (
    <Dropdown.Item onAction={() => navigate({ to })}
      className="w-full flex items-center justify-between">
      <Label>{children}</Label>
      <Icon icon={icon}/>
    </Dropdown.Item>
  )
}
