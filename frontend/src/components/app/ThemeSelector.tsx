import { styled } from "@linaria/react"
export default function ThemeSelector() {
  let l = localStorage
  let c = ["dark", "light"]
  let y = true
  let s = () => {
    if (y) y = false
    else return
    let t = document.getElementById("theme_switcher")!
    t.classList.remove("animate")
    setTimeout(() => {
      t.classList.add("animate")
      setTimeout(() => y = true, 500)
    }, 20)
    let n = c[(c.indexOf(l.getItem("theme") || "light") + 1) % c.length]
    l.setItem("theme", n)
    document.documentElement.setAttribute("data-theme", n)
  }

  return (
    <Selector id="theme_switcher" onClick={s}>
      <span className="outer left">
        <span className="inner"></span>
      </span>
      <span className="outer right">
        <span className="inner"></span>
      </span>
    </Selector>
  )
}

const Selector = styled.div`
@keyframes large {
  0% {
    height: calc(30px * var(--scale));
    width: calc(15px * var(--scale));
    border-radius: calc(30px * var(--scale)) 0 0 calc(30px * var(--scale));
    margin: calc(-2.5px * var(--scale)) 0;
  }
  100% {
    width: calc(25px * var(--scale));
    width: calc(12.5px * var(--scale));
    border-radius: calc(25px * var(--scale)) 0 0 calc(25px * var(--scale));
    margin: 0;
  }
}

@keyframes inner {
  0% {
    transform: scale(2);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes rot {
  0% {
    transform: rotate(-180deg)
  }
  100% {
    transform: rotate(0deg)
  }
}

display: flex;
justify-content: center;
align-items: center;
cursor: pointer;
--scale: .8;
width: calc(30px * var(--scale));
height: calc(30px * var(--scale));

&.animate {
  animation: rot .52s ease forwards;
  & span.left.outer {
    animation: large .5s linear forwards;
  }
  & span.inner {
    animation: inner .5s linear forwards;
  }
}

& span.outer {
  display: flex;
  align-items: center;
  width: calc(12.5px * var(--scale));
  height: calc(25px * var(--scale));
  overflow: hidden;
}
& span.inner {
  display: inline-block;
  height: calc(10px * var(--scale));
  width: calc(5px * var(--scale)) ;
}
& span.left.outer {
  justify-content: flex-end;
  border-radius: calc(25px * var(--scale)) 0 0 calc(25px * var(--scale));
  background: var(--text-beta);
  & span.inner {
    border-radius: calc(10px * var(--scale)) 0 0 calc(10px * var(--scale));
    background: var(--bg-alpha);
  }
}
& span.right.outer {
  border-radius: 0 calc(30px * var(--scale)) calc(30px * var(--scale)) 0;
  border: calc(2px * var(--scale)) solid var(--text-beta);
  border-left: 0;
  & span.inner {
    border-radius: 0 calc(10px * var(--scale)) calc(10px * var(--scale)) 0;
    background: var(--text-beta);
  }
}
`