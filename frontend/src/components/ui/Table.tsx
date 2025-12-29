import { styled } from "@linaria/react"
import { Link } from "@tanstack/react-router"

interface TableProps {
  $columns?: string
}

export const Table = styled.section<TableProps>`
  display: flex;
  flex-flow: column;
  --table-columns: ${({ $columns }) => $columns ?? "1fr"};
`

export const TableBody = styled.div`
  display: flex;
  flex-flow: column;
  border: var(--border-alpha);
  border-radius: .4rem;
`

const BaseRow = styled.div`
  display: grid;
  grid-template-columns: var(--table-columns);
  & > *:not(:last-child) {
    border-right: var(--border-alpha);
  }
  `

// TODO: restyle this for better readability
export const TableHeader = styled(BaseRow)`
  font-weight: 600;
  color: var(--text-beta);
  border: var(--border-alpha);
  border-radius: .4rem;
  margin-bottom: .3rem;
`

export const ClickableRow = styled(Link)`
  display: grid;
  grid-template-columns: var(--table-columns);
  &:hover {
    background: var(--bg-gamma);
    color: var(--text-beta);
  }
  & > *:not(:last-child) {
    border-right: var(--border-alpha);
  }
`

interface TableRowProps {
  $noBorder?: boolean
}

export const TableRow = styled(BaseRow) <TableRowProps>`
  &:not(:last-of-type) {
    border-bottom: ${({ $noBorder }) => $noBorder ? "none" : "var(--border-alpha)"};
  }
`

interface TableCellProps {
  $align?: "left" | "right" | "center" | "space-between"
  $sortable?: boolean
  $active?: boolean
  $cols?: number,
}

export const TableCell = styled.div<TableCellProps>`
  display: flex;
  align-items: center;
  padding: .3rem .6rem;
  justify-content: ${({ $align }) => $align === "right"
    ? "flex-end"
    : $align === "center"
      ? "center"
      : $align === "space-between"
        ? "space-between"
        : "flex-start"};
  overflow: hidden;
  grid-column: ${({ $cols }) => $cols === undefined ? "auto" : `span ${$cols}`};

  ${({ $sortable }) => $sortable ? `
    cursor: pointer;
    user-select: none;
    &:hover {
      background: var(--bg-beta);
    }
  ` : ""}

  ${({ $active }) => $active ? `
    color: var(--text-beta);
  ` : ""}
`

export const ClickableTableCell = styled(TableCell)`
  padding: 0;
  & > a {
    width: 100%;
    height: 100%;
    padding: .3rem .6rem;
    &:hover {
      background: var(--bg-beta);
      color: var(--text-beta);
    }
  }
`

export const SortButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  aspect-ratio: 1;
  margin-left: .5rem;
  border: 1px solid var(--border-alpha-color);
  border-radius: .25rem;
  background: transparent;
  color: var(--text-alpha);
  cursor: pointer;
  font-size: .75rem;
  &:hover {
    background: var(--bg-gamma);
    color: var(--text-beta);
  }
`

export const SortSelect = styled.select`
  border: 1px solid var(--border-alpha-color);
  border-radius: .25rem;
  padding: .2rem .4rem;
  color: var(--text-beta);
  background: transparent;
  cursor: pointer;
  font-size: .85rem;
  &:hover {
    background: var(--bg-gamma);
  }
  & option {
    background: var(--bg-beta);
    color: var(--text-beta);
  }
`

export const TableErrorSection = styled.div`
  padding: .4rem .6rem;
  background: rgba(224, 37, 37, 0.08);
  border-top: 2px dashed var(--border-alpha-color);
  font-size: .8rem;
  & div {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: .5rem;
    & p {
      font-weight: 500;
    }
    & span {
      font-family: Kode;
      font-weight: 600;
      padding: .1rem .3rem;
      background: rgba(236, 56, 56, 0.08);
      border-radius: .25rem;
      border: 1px solid rgba(236, 56, 56, 0.2);
    }
  }

  & > p {
    font-weight: 500;
    & span {
      color: #e02525;
      margin-left: .3rem;
    }
  }
`
export const PossibleErrorRow = styled.div`
  &:not(:last-child) {
    border-bottom: var(--border-alpha);
  }
`