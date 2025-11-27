# Management command to seed demo patients, practitioners, and observations for patient-side testing
from django.core.management.base import BaseCommand
from backend.fhir.models.resources import Patient, Practitioner, Observation
from backend.identity.did_manager import get_did_manager
from backend.blockchain.hash_manager import get_hash_manager
from backend.blockchain.cardano_client import get_cardano_client
from django.db import IntegrityError, transaction
import json
from datetime import datetime, timedelta


class Command(BaseCommand):
    help = 'Seed demo patients, practitioners, and observations for testing patient flows'

    def handle(self, *args, **options):
        self.stdout.write('Seeding demo data...')

        did_manager = get_did_manager()
        hash_manager = get_hash_manager()
        cardano_client = get_cardano_client()

        demo_patients = [
            {
                'name': [{'family': 'Okonkwo', 'given': ['Adebayo']}],
                'gender': 'male',
                'birth_date': '1978-06-12',
            },
            {
                'name': [{'family': 'Nwosu', 'given': ['Chioma']}],
                'gender': 'female',
                'birth_date': '1993-02-25',
            },
        ]

        created = {'patients': [], 'practitioners': [], 'observations': []}

        try:
            # Create practitioners
            pr1 = Practitioner.objects.create(
                did=did_manager.create_did(entity_type='provider')['did'],
                name=[{'family': 'LUTH', 'given': ['Dr', 'A'] }],
                telecom=[{'system': 'phone', 'value': '+2348010000000'}],
            )
            pr2 = Practitioner.objects.create(
                did=did_manager.create_did(entity_type='provider')['did'],
                name=[{'family': 'Lagoon', 'given': ['Dr', 'B'] }],
                telecom=[{'system': 'phone', 'value': '+2348010000001'}],
            )
            created['practitioners'].extend([str(pr1.id), str(pr2.id)])

            # Create patients and a sample observation for each
            for idx, pdata in enumerate(demo_patients, start=1):
                did_info = did_manager.create_did(entity_type='patient')
                patient = Patient.objects.create(
                    did=did_info['did'],
                    identifier=[{'system': 'medblock', 'value': f'DEMO-PAT-{idx}'}],
                    name=pdata['name'],
                    gender=pdata['gender'],
                    birth_date=pdata['birth_date']
                )
                created['patients'].append(str(patient.id))

                # Create an observation
                obs = Observation(
                    patient=patient,
                    practitioner=pr1,
                    status='final',
                    category=[{'coding': [{'system': 'http://loinc.org', 'code': '58410-2'}]}],
                    code={'coding': [{'system': 'http://loinc.org', 'code': '789-8', 'display': 'Hemoglobin'}], 'text': 'Hemoglobin'},
                    effective_datetime=datetime.utcnow(),
                    value_quantity={'value': 13.5, 'unit': 'g/dL'},
                )
                # Save to obtain an id
                obs.save()

                # Generate hash and submit to Cardano (mocked if client not configured)
                record_hash = hash_manager.generate_record_hash(obs)
                obs.blockchain_hash = record_hash
                tx_id = cardano_client.submit_record_hash(
                    record_hash=record_hash,
                    record_type='observation',
                    patient_did=patient.did,
                    provider_did=pr1.did,
                    additional_metadata={'demo': True}
                )
                obs.blockchain_tx_id = tx_id
                obs.save()

                created['observations'].append(str(obs.id))

            self.stdout.write(self.style.SUCCESS('Demo data seeded successfully.'))
            self.stdout.write(json.dumps(created, indent=2))

        except IntegrityError as ie:
            self.stderr.write(f'Integrity error while seeding demo data: {ie}')
        except Exception as e:
            self.stderr.write(f'Error while seeding demo data: {e}')
            raise
