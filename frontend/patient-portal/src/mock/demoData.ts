// Lightweight demo data and helpers used when VITE_DEMO=true
const demoPatient = {
  patient_id: 'patient-demo-1',
  did: 'did:prism:demo_patient_0001',
  public_key: 'pub_demo_0001',
  private_key: 'priv_demo_0001',
  name: [
    {
      given: ['Demo'],
      family: 'Patient'
    }
  ],
  gender: 'female',
  birth_date: '1990-01-01',
  telecom: [{ system: 'email', value: 'demo.patient@example.com' }]
}

let observations = [
  {
    id: 'obs-demo-1',
    patient_id: demoPatient.patient_id,
    status: 'final',
    code: 'blood_pressure',
    value_quantity: { value: 118, unit: 'mmHg' },
    effective_datetime: new Date().toISOString(),
    blockchain_hash: 'mock_hash_1',
    blockchain_tx_id: 'mock_tx_mock_hash_1'
  },
  {
    id: 'obs-demo-2',
    patient_id: demoPatient.patient_id,
    status: 'final',
    code: 'temperature',
    value_quantity: { value: 36.7, unit: 'C' },
    effective_datetime: new Date().toISOString(),
    blockchain_hash: 'mock_hash_2',
    blockchain_tx_id: 'mock_tx_mock_hash_2'
  }
]





let consents: any[] = []

function createPatientDID(data: any) {
  // return a clone with provided fields merged
  const result = {
    ...demoPatient,
    name: data.name || demoPatient.name,
    gender: data.gender || demoPatient.gender,
    birth_date: data.birth_date || demoPatient.birth_date,
    telecom: data.telecom || demoPatient.telecom,
  }

  return Promise.resolve({
    patient_id: result.patient_id,
    did: result.did,
    public_key: result.public_key,
    private_key: result.private_key,
  })
}

function resolveDID(did: string) {
  if (did === demoPatient.did) {
    return Promise.resolve({ did: demoPatient.did, public_key: demoPatient.public_key })
  }
  return Promise.resolve(null)
}

function getProfile() {
  return Promise.resolve({
    type: 'patient',
    id: demoPatient.patient_id,
    did: demoPatient.did,
    name: demoPatient.name,
    gender: demoPatient.gender,
    birth_date: demoPatient.birth_date,
  })
}

function getObservations(patientId: string) {
  return Promise.resolve(observations.filter(o => o.patient_id === patientId))
}

function getObservation(id: string) {
  const o = observations.find(x => x.id === id)
  return Promise.resolve(o || null)
}

function createObservation(data: any) {
  const id = `obs-demo-${observations.length + 1}`
  const obs = {
    id,
    patient_id: data.patient_id,
    status: data.status || 'final',
    code: data.code || 'custom',
    value_quantity: data.value_quantity || null,
    effective_datetime: data.effective_datetime || new Date().toISOString(),
    blockchain_hash: `mock_hash_${id}`,
    blockchain_tx_id: `mock_tx_${id}`,
  }
  observations.unshift(obs)
  return Promise.resolve(obs)
}

function grantConsent(data: any) {
  const id = `consent-${consents.length + 1}`
  const c = {
    id,
    patient_did: demoPatient.did,
    provider_did: data.provider_did,
    duration_hours: data.duration_hours || 24,
    status: 'active',
    scope: data.scope || [],
  }
  consents.push(c)
  return Promise.resolve(c)
}

function revokeConsent(consentId: string) {
  consents = consents.map(c => (c.id === consentId ? { ...c, status: 'revoked' } : c))
  return Promise.resolve({ id: consentId, status: 'revoked' })
}

function getActiveConsents() {
  return Promise.resolve(consents.filter(c => c.status === 'active'))
}

function getAccessLog(_patientDid: string) {
  // return recent mock access log entries
  return Promise.resolve([
    { accessor_did: 'did:prism:provider_demo_1', action: 'read', resource_type: 'Observation', resource_id: observations[0].id, timestamp: new Date().toISOString(), blockchain_tx_id: 'mock_access_tx_1' }
  ])
}

export default {
  createPatientDID,
  resolveDID,
  getProfile,
  getObservations,
  getObservation,
  createObservation,
  grantConsent,
  revokeConsent,
  getActiveConsents,
  getAccessLog,

}
