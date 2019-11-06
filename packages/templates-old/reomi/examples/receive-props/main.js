import { render, WeElement, define } from '../../src/omi'

define('my-counter', class extends WeElement {
  static observe = true

  data = {
    count: 1
  }

  sub = () => {
    this.data.count--
  }

  add = () => {
    this.data.count++
  }

  receiveProps(props, data, old) {
    console.log(old)
    data.count = props.value
  }

  render() {
    console.log(111)
    return (
      <div>
        <button onClick={this.sub}>-</button>
        <span>{this.data.count}</span>
        <button onClick={this.add}>+</button>
      </div>
    )
  }
})

define('my-app', class extends WeElement {
  reset = () => {
    this.value = Math.floor(Math.random() * 100)
    this.update()
  }

  render() {
    return (
      <div>
        <my-counter value={this.value} />
        <button onClick={this.reset}>reset value</button>
      </div>
    )
  }
})

render(<my-app />, 'body')
