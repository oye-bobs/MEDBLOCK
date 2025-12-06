export const mockAuditLogs = [
    {
        id: 1,
        actor: 'Dr. Musa',
        action: 'Viewed Lab Report',
        location: 'Lagos Island Hospital',
        timestamp: '10:42 AM',
        verified: true,
        type: 'view',
    },
    {
        id: 2,
        actor: 'St. Nicholas Hospital',
        action: 'Uploaded New Prescription',
        location: 'St. Nicholas Hospital',
        timestamp: '9:15 AM',
        verified: true,
        type: 'upload',
    },
    {
        id: 3,
        actor: 'AXA Mansard HMO',
        action: 'Access Request',
        location: 'AXA Mansard',
        timestamp: 'Yesterday',
        verified: false,
        type: 'request',
    },
]

export const mockNotifications = [
    {
        id: 1,
        title: 'New Record Available',
        message: 'Lab results from Lagos Island Hospital are now available.',
        time: '2 hours ago',
        type: 'record',
    },
    {
        id: 2,
        title: 'Access Request',
        message: 'Dr. John from XYZ Hospital is requesting access to your records.',
        time: '5 hours ago',
        type: 'access',
    },
    {
        id: 3,
        title: 'Blockchain Verification',
        message: 'Your recent prescription has been verified on the Cardano blockchain.',
        time: '1 day ago',
        type: 'security',
    },
]

export const mockHealthSummary = {
    bloodGroup: 'O+',
    allergies: ['Penicillin', 'Peanuts'],
    conditions: ['Hypertension'],
    vitals: {
        bp: '120/80',
        heartRate: '72 bpm',
        weight: '75 kg',
    },
    medications: ['Lisinopril 10mg', 'Aspirin 81mg'],
    immunizations: ['COVID-19 (2 doses)', 'Tetanus (2020)'],
}

export const mockSecurityStatus = {
    backupStatus: true,
    phoneVerified: true,
    emailVerified: true,
    twoFactorEnabled: true,
    securityScore: 85,
}
