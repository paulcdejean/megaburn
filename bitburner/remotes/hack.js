export async function main(ns) {
  await ns.hack(ns.args[0] , {
    additionalMsec: ns.args[1],
    stock: ns.args[2],
    threads: (ns.args[3])
  })
}
