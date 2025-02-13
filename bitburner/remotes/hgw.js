export async function main(ns) {
  if (ns.args[0] === "hack") {
    await ns.hack(ns.args[1] , {
      additionalMsec: ns.args[2],
      stock: ns.args[3],
      threads: (ns.args[4])
    })
  } else if (ns.args[0] === "grow") {
    await ns.grow(ns.args[1] , {
      additionalMsec: ns.args[2],
      stock: ns.args[3],
      threads: (ns.args[4])
    })
  } else {
    await ns.weaken(ns.args[1] , {
      additionalMsec: ns.args[2],
      stock: ns.args[3],
      threads: (ns.args[4])
    })
  }
  ns.tprint(ns.args[0])
  ns.writePort(ns.args[5])
  ns.clearPort(ns.args[5])
}
