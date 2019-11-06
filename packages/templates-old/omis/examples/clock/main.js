import { render } from '../../src/omis'

const Clock = (props, store) => {
  const { hours, minutes, seconds } = store
  return (
    <svg viewBox="-50 -50 100 100">
      <circle class="clock-face" r="48" />

      {store.arr.map(i => (
        <line class="major" y1="35" y2="45" transform={`rotate(${30 * i})`} />
      ))}

      {store.arr.map(i =>
        [1, 2, 3, 4].map(o => (
          <line
            class="minor"
            y1="42"
            y2="45"
            transform={`rotate(${6 * (i + o)})`}
          />
        ))
      )}

      <line
        class="hour"
        y1="2"
        y2="-20"
        transform={`rotate(${30 * hours + minutes / 2})`}
      />

      <line
        class="minute"
        y1="4"
        y2="-30"
        transform={`rotate(${6 * minutes + seconds / 10})`}
      />

      <g transform={`rotate(${6 * seconds})`}>
        <line class="second" y1="10" y2="-38" />
        <line class="second-counterweight" y1="10" y2="2" />
      </g>
    </svg>
  )
}

Clock.store = _ => {
  const store = {
    arr: [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55],
    updateTime() {
      const time = new Date()
      this.hours = time.getHours()
      this.minutes = time.getMinutes()
      this.seconds = time.getSeconds()
    }
  }

  store.updateTime()
  setInterval(() => {
    store.updateTime()
    store.update()
  }, 1000)

  return store
}

Clock.css = `

svg {
	width: 100%;
	height: 100%;
}

.clock-face {
	stroke: #333;
	fill: white;
}

.minor {
	stroke: #999;
	stroke-width: 0.5;
}

.major {
	stroke: #333;
	stroke-width: 1;
}

.hour {
	stroke: #333;
}

.minute {
	stroke: #666;
}

.second,
.second-counterweight {
	stroke: rgb(180, 0, 0);
}

.second-counterweight {
	stroke-width: 3;
}
`
render(<Clock />, 'body')
