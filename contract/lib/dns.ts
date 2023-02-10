import { packet } from 'dns-packet'
import { ethers } from 'ethers'
import { BufferWriter, DNSRecord } from 'dns-js'
import { utils } from './utils'
// import { namehash } from 'eth-ens-namehash'
const namehash = require('eth-ens-namehash')

const hexEncodeName = (name) => {
  return '0x' + packet.name.encode(name).toString('hex')
}

const hexEncodeTXT = (keys) => {
  return '0x' + packet.answer.encode(keys).toString('hex')
}

const displayNode = (node) => {
  console.log(`node                : ${node}`)
  console.log(`node.dns.namehash   : ${namehash.hash(node)}`)
  console.log(`node.label.k256.b   : ${ethers.utils.keccak256(ethers.utils.toUtf8Bytes(node))}`)
  console.log(`node.label.k256.bB  : ${ethers.utils.arrayify(ethers.utils.keccak256(ethers.utils.toUtf8Bytes(node)))}`)
  console.log(`node.utils.namehash : ${utils.namehash(node)}`)
  console.log(`node.utils.namehashS: ${utils.bytesToHexString(utils.namehash(node))}`)
  console.log(`node.utils.namehashSB: ${ethers.utils.arrayify(utils.bytesToHexString(utils.namehash(node)))}`)
  console.log(`node.toUtfBytes     : ${ethers.utils.toUtf8Bytes(node)}`)
  console.log(`node.dnsName        : ${dnsName(node)}`)
  // TLD_NODE = keccak256(bytes.concat(bytes32(0), keccak256(bytes(_tld))));
  // console.log(`node.namehash0  : ${ethers.utils.keccak256(ethers.utils.concat(Constants.EMPTY_BYTES32, ethers.utils.keccak256(ethers.utils.toUtf8Bytes(node)));
  //   console.log(`node.keccak256: ${ethers.utils.keccak256(node)}`)
}

const makeNode = (parent, child) => {
  const parentHash = namehash.hash(parent)
  //   const childHash = namehash.hash(child)
  //   return ethers.utils.keccak256(ethers.utils.concat([parentHash, childHash]))
  const childK256 = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(child))
  return ethers.utils.keccak256(ethers.utils.concat([parentHash, childK256]))
}

const dnsName = (name) => {
  // strip leading and trailing .
  const n = name.replace(/^\.|\.$/gm, '')

  const bufLen = n === '' ? 1 : n.length + 2
  const buf = Buffer.allocUnsafe(bufLen)

  let offset = 0
  if (n.length) {
    const list = n.split('.')
    for (let i = 0; i < list.length; i++) {
      const len = buf.write(list[i], offset + 1)
      buf[offset] = len
      offset += len + 1
    }
  }
  buf[offset++] = 0
  return (
    '0x' +
        buf.reduce(
          (output, elem) => output + ('0' + elem.toString(16)).slice(-2),
          ''
        )
  )
}

const encodeARecord = (recName, recAddress) => {
  // Sample Mapping
  // a.test.country. 3600 IN A 1.2.3.4
  /*
    name: a.test.country
    type: A
    class: IN
    ttl: 3600
    address: 1.2.3.4
  */
  // returns 0161047465737407636f756e747279000001000100000e10000401020304

  // a empty address is used to remove existing records
  let rec = {}
  rec = {
    name: recName,
    type: DNSRecord.Type.A,
    class: DNSRecord.Class.IN,
    ttl: 3600,
    address: recAddress
  }
  const bw = new BufferWriter()
  const b = DNSRecord.write(bw, rec).dump()
  //   console.log(`recName: ${recName}`)
  //   console.log(`recAddress: ${recAddress}`)
  console.log(`rec: ${JSON.stringify(rec)}`)
  console.log(`b.json: ${JSON.stringify(b)}`)
  console.log(`b.string: ${b.toString()}`)
  console.log(`recordText: ${b.toString('hex')}`)
  return b.toString('hex')
}

const encodeCNAMERecord = (recName, recData) => {
  // Sample Mapping
  // a.test.country. 3600 IN CNAME harmony.one
  /*
    name: a.test.country
    type: CNAME
    class: IN
    ttl: 3600
    data: harmony.one
  */
  // returns 036f6e65047465737407636f756e747279000005000100000e10000d076861726d6f6e79036f6e6500

  // a empty address is used to remove existing records
  let rec = {}
  rec = {
    name: recName,
    type: DNSRecord.Type.CNAME,
    class: DNSRecord.Class.IN,
    ttl: 3600,
    data: recData
  }
  const bw = new BufferWriter()
  const b = DNSRecord.write(bw, rec).dump()
  //   console.log(`recName: ${recName}`)
  //   console.log(`recAddress: ${recAddress}`)
  console.log(`rec: ${JSON.stringify(rec)}`)
  console.log(`b.json: ${JSON.stringify(b)}`)
  console.log(`b.string: ${b.toString()}`)
  console.log(`recordText: ${b.toString('hex')}`)
  return b.toString('hex')
}

const encodeSRecord = (recName, primary, admin, serial, refresh, retry, expiration, minimum) => {
  // Sample Mapping
  // test.country. 86400 IN SOA ns1.countrydns.xyz. hostmaster.test.country. 2018061501 15620 1800 1814400 14400
  /*
   name: test.country.
   ttL: 86400
   class: IN
   type: SOA
   primary: ns1.countrydns.xyz.
   admin: hostmaster.test.country.
   serial: 2018061501
   refresh: 15620
   retry: 1800
   expiration: 1814400
   minimum: 14400
  */
  // returns  047465737407636f756e747279000006000100000000003a036e73310a636f756e747279646e730378797a000a686f73746d61737465720474657374c00578492cbd00003d0400000708001baf8000003840
  const rec = {
    name: recName,
    ttL: 86400,
    type: DNSRecord.Type.SOA,
    class: DNSRecord.Class.IN,
    primary,
    admin,
    serial,
    refresh,
    retry,
    expiration,
    minimum
  }
  const bw = new BufferWriter()
  const b = DNSRecord.write(bw, rec).dump()
  //   console.log(`recordText: ${b.toString('hex')}`)
  return b.toString('hex')
}

const encodeTXTRecord = (recName, recText) => {
  // Sample Mapping
  // test.country. SampleText
  /*
    name:  test.country.
    data: SampleText
    */
  // returns
  const rec = {
    name: recName,
    type: DNSRecord.Type.TXT,
    class: DNSRecord.Class.IN,
    data: recText
  }
  const bw = new BufferWriter()
  const b = DNSRecord.write(bw, rec).dump()
  // console.log(`recordText: ${b.toString('hex')}`)
  return b.toString('hex')
}

export {
// module.exports = {
  hexEncodeName,
  hexEncodeTXT,
  displayNode,
  makeNode,
  dnsName,
  encodeARecord,
  encodeCNAMERecord,
  encodeSRecord,
  encodeTXTRecord
}