import { styled } from "@linaria/react"

interface Props {
  errors: {
    [error_name: string]: {
      message?: string,
    }
  }
}
export default function ErrorBox({ errors }: Props) {
  if (Object.is(errors, {}) || errors === undefined || Object.entries(errors).length === 0) return

  return (
    <Box>
      <p>Errors</p>
      {/* TODO: Make it properly recursive! */}
      {/* NOTE: Even though the styling seems funky, it looks kinda good. */}
      {Object.entries(errors).map(error => (
        <div key={error[0]}>
          <p className="error_name">{error[0]}</p>
          {error[1].message ? error[1].message
            : (error[1].constructor.name === "Object" && error[1] !== null) ? (
              <div className="nested_error">
                {Object.entries(error[1]).map(err => (
                  <div key={err[0]}>
                    <p className="error_name">{err[0]}</p>
                    <p>{err[1].message ? err[1].message : "Somethings really wrong!"}</p>
                  </div>
                ))}
              </div>
            )
            : "Somethings wrong!"}
        </div>
      ))}
    </Box>
  )
}

const Box = styled.section`
  align-self: flex-start;
  position: relative;
  display: flex;
  flex-flow: column;
  align-items: flex-start;
  padding: .6rem;
  padding-top: 1.1rem;
  gap: .4rem;
  border: 2px solid #e2394f;
  border-radius: .2rem;
  margin-top: 1.1rem;
  & > p {
    position: absolute;
    top: -1.1rem;
    left: .8rem;
    border-radius: 10rem;
    padding: .3rem .6rem;
    background: #e2394f;
    font-weight: 600;
    color: #eee;
  }
  & div {
    display: flex;
    align-items: center;
    gap: .3rem;
    width: 100%;
    &:not(:last-of-type) {
      border-bottom: var(--border-alpha);
      padding-bottom: .4rem;
    }
    & p.error_name {
      font-weight: 500;
      background: var(--bg-beta);
      padding: .2rem .4rem;
      border-radius: .2rem;
    }
    & div.nested_error {
      display: flex;
      flex-flow: column;

    }
  }
`

