import { define, WeElement } from '../../src/omi'

export default class HelloElement extends WeElement {
  static defaultProps = {
    msg: '',
    propFromParent: '123111',
    testDefault: 'abc'
  }

  onClick = evt => {
    // trigger CustomEvent
    this.fire('myEvent', { name: 'dntzhang', age: 12 })
    evt.stopPropagation()
  }

  static css = `
        div {
          color: red;
          cursor: pointer;
        }`
  

  receiveProps(props, data, oldProps) {
    console.log(props, data, oldProps)
  }

  render(props) {
    return (
      <div onClick={this.onClick}>
        Hello {props.msg} {props.propFromParent}
        <div>Click Me!</div>
        <div>{props.testDefault}</div>
      </div>
    )
  }
}

define('hello-element', HelloElement)
