import { styled } from "@linaria/react"

export const Form = styled.form`
  display: flex;
  flex-flow: column;
  align-items: flex-start;
  gap: 1rem;
  max-width: 45rem;
  width: 100%;
`

export const FormField = styled.div`
  display: flex;
  flex-flow: column;
  gap: .4rem;
  width: 100%;
`

export const FormLabel = styled.label`
  font-weight: 500;
`

const TextFieldCommon = `
  font-family: monospace;
  background: var(--bg-beta);
  border: var(--border-alpha);
  color: var(--text-beta);
  padding: .45rem .6rem;
  font-size: .9rem;
  border-radius: .2rem;
  &:hover {
    background: var(--bg-gamma);
  }
  &:focus {
    background: var(--bg-alpha);
    border-color: var(--text-beta);
  }
`

export const FormInput = styled.input`
  ${TextFieldCommon}
`

export const FormTextarea = styled.textarea`
  ${TextFieldCommon}
  resize: vertical;
`