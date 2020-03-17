export const castDownEvent = (vm, ev, data) => {
  if (vm && vm.$children.length > 0) {
    vm.$emit(ev, data)
    vm.$children.forEach((kid) => {
      castDownEvent(kid, ev, data)
    })
  }
}

export const lookUp = (parent, key) => {
  if (parent[key]) {
    return parent[key]
  } else {
    let gradParent = parent.$parent
    if (gradParent) {
      return lookUp(gradParent, key)
    }
  }
}
