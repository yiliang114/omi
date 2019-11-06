import { define, WeElement } from '../../../src/omi'
import vm from '../view-model/todo'

define('todo-list', class extends WeElement {
  css() {
    return `
    .completed{
      color: #d9d9d9;
      text-decoration: line-through;
    }
   `
  }

  onChange = (evt, id) => {
    if (evt.target.checked) {
      vm.complete(id)
    } else {
      vm.uncomplete(id)
    }
  }

  onClick = id => {
    vm.remove(id)
  }

  render(props) {
    return (
      <ul>
        {props.items.map(item => (
          <li class={item.completed && 'completed'}>
            <input
              type="checkbox"
              onChange={evt => {
                this.onChange(evt, item.id)
              }}
              checked={item.completed}
            />
            {item.text}
            <button
              onClick={() => {
                this.onClick(item.id)
              }}
            >
              remove
            </button>
          </li>
        ))}
      </ul>
    )
  }
})
