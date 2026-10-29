import { createHash, randomBytes } from 'node:crypto'

import { generate } from 'selfsigned'

const CERTIFICATE_LIFETIME_MS = 7 * 24 * 60 * 60 * 1000

const pemToDer = (pem: string) => Buffer.from(pem.replace(/-----[^-]+-----/g, '').replace(/\s+/g, ''), 'base64')

// Chrome accepts serverCertificateHashes only for certificates that live less than 14 days.
// The hash is SHA-256 of the DER certificate, which is what WebTransport compares.
export const createGameCertificate = async (host: string) => {
  const notBeforeDate = new Date()
  const notAfterDate = new Date(notBeforeDate.getTime() + CERTIFICATE_LIFETIME_MS)
  const generated = await generate([{ name: 'commonName', value: host }], {
    algorithm: 'sha256',
    keyType: 'ec',
    curve: 'P-256',
    notBeforeDate,
    notAfterDate,
    extensions: [
      { name: 'basicConstraints', cA: false },
      { name: 'keyUsage', digitalSignature: true, keyEncipherment: true },
      { name: 'extKeyUsage', serverAuth: true },
      {
        name: 'subjectAltName',
        altNames: [
          { type: 7, ip: host },
          { type: 2, value: 'localhost' },
        ],
      },
    ],
  })
  const der = pemToDer(generated.cert)

  return {
    cert: generated.cert,
    privateKey: generated.private,
    certHash: createHash('sha256').update(der).digest('base64'),
    secret: randomBytes(24).toString('hex'),
  }
}
