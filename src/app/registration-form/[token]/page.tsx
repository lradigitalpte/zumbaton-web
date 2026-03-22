'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { apiFetchJson } from '@/lib/api-fetch'
import { getAdminApiUrl } from '@/lib/admin-api-url'

interface FormData {
  fullNameNric: string
  residentialAddress: string
  postalCode: string
  dateOfBirth: string
  email: string
  phone: string
  gender: string
  bloodGroup: string
  emergencyContact: string
  emergencyContactPhone: string
  parentGuardianName: string
  parentGuardianSignature: string
  parentGuardianDate: string
  memberSignature: string
  termsAccepted: boolean
  mediaConsent: boolean
}

export default function RegistrationFormPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [userData, setUserData] = useState<any>(null)
  const [pdfDownloadUrl, setPdfDownloadUrl] = useState<string | null>(null)
  const [showPdfPreview, setShowPdfPreview] = useState(false)
  const [pdfGenerated, setPdfGenerated] = useState(false)
  
  const [formData, setFormData] = useState<FormData>({
    fullNameNric: '',
    residentialAddress: '',
    postalCode: '',
    dateOfBirth: '',
    email: '',
    phone: '',
    gender: '',
    bloodGroup: '',
    emergencyContact: '',
    emergencyContactPhone: '',
    parentGuardianName: '',
    parentGuardianSignature: '',
    parentGuardianDate: '',
    memberSignature: '',
    termsAccepted: false,
    mediaConsent: false,
  })

  useEffect(() => {
    fetchFormData()
  }, [token])

  const fetchFormData = async () => {
    try {
      setLoading(true)
      const adminApiUrl = getAdminApiUrl()
      const apiUrl = `${adminApiUrl}/api/registration-form/${token}`
      
      const response = await fetch(apiUrl)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('[Registration Form] API error:', response.status, errorText)
        setError(`Failed to load form: ${response.status === 404 ? 'Form not found' : 'Server error'}`)
        return
      }
      
      const result = await response.json()

      if (!result.success) {
        setError(result.error || 'Invalid or expired form link')
        return
      }

      setUserData(result.data.user)
      // Pre-fill form with user data
      setFormData(prev => ({
        ...prev,
        fullNameNric: result.data.user.name || '',
        email: result.data.user.email || '',
        phone: result.data.user.phone || '',
        dateOfBirth: result.data.user.date_of_birth || '',
      }))
    } catch (err) {
      console.error('Error fetching form:', err)
      setError('Failed to load registration form')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  // Check if all required fields are filled
  const isFormValid = () => {
    return (
      formData.fullNameNric.trim() !== '' &&
      formData.residentialAddress.trim() !== '' &&
      formData.postalCode.trim() !== '' &&
      formData.dateOfBirth !== '' &&
      formData.email.trim() !== '' &&
      formData.phone.trim() !== '' &&
      formData.gender.trim() !== '' &&
      formData.bloodGroup.trim() !== '' &&
      formData.emergencyContact.trim() !== '' &&
      formData.emergencyContactPhone.trim() !== '' &&
      formData.memberSignature.trim() !== '' &&
      formData.termsAccepted &&
      formData.mediaConsent
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate all required fields
    if (!formData.fullNameNric.trim()) {
      setError('Please enter your full name as in NRIC')
      return
    }
    if (!formData.residentialAddress.trim()) {
      setError('Please enter your residential address')
      return
    }
    if (!formData.postalCode.trim()) {
      setError('Please enter your postal code')
      return
    }
    if (!formData.dateOfBirth) {
      setError('Please select your date of birth')
      return
    }
    if (!formData.email.trim()) {
      setError('Please enter your email address')
      return
    }
    if (!formData.phone.trim()) {
      setError('Please enter your phone number')
      return
    }
    if (!formData.gender.trim()) {
      setError('Please select your gender')
      return
    }
    if (!formData.bloodGroup.trim()) {
      setError('Please select your blood group')
      return
    }
    if (!formData.emergencyContact.trim()) {
      setError('Please enter emergency contact name')
      return
    }
    if (!formData.emergencyContactPhone.trim()) {
      setError('Please enter emergency contact phone')
      return
    }
    if (!formData.termsAccepted) {
      setError('Please accept the terms and conditions')
      return
    }
    if (!formData.mediaConsent) {
      setError('Please accept the media consent')
      return
    }
    if (!formData.memberSignature.trim()) {
      setError('Please provide your signature by typing your full name')
      return
    }
    if (formData.memberSignature.trim().length < 3) {
      setError('Please enter your complete full name as signature')
      return
    }

    // Step 1: Generate PDF for preview/download
    if (!pdfGenerated) {
      try {
        setSubmitting(true)
        setError('')

        const pdfResponse = await fetch('/api/registration-form/generate-pdf', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            memberSignatureDate: new Date().toISOString(),
            submittedAt: new Date().toISOString(),
          }),
        })

        const result = await pdfResponse.json()

        if (result.success && result.pdf) {
          // Convert base64 to blob
          const byteCharacters = atob(result.pdf)
          const byteNumbers = new Array(byteCharacters.length)
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i)
          }
          const byteArray = new Uint8Array(byteNumbers)
          const pdfBlob = new Blob([byteArray], { type: 'application/pdf' })
          
          const url = URL.createObjectURL(pdfBlob)
          setPdfDownloadUrl(url)
          setPdfGenerated(true)
          setShowPdfPreview(true)
        } else {
          setError(result.error || 'Failed to generate PDF. Please try again.')
        }
      } catch (pdfError) {
        console.error('Error generating PDF:', pdfError)
        setError('Error generating PDF. Please try again.')
      } finally {
        setSubmitting(false)
      }
      return
    }

    // Step 2: Final submission to backend
    try {
      setSubmitting(true)
      setError('')

      const adminApiUrl = getAdminApiUrl()
      const apiUrl = `${adminApiUrl}/api/registration-form/${token}`
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('[Registration Form] Submit error:', response.status, errorText)
        setError(`Failed to submit form: ${response.status === 404 ? 'Form not found' : 'Server error'}`)
        return
      }

      const result = await response.json()

      if (!result.success) {
        setError(result.error || 'Failed to submit form')
        return
      }

      setSuccess(true)
    } catch (err) {
      console.error('Error submitting form:', err)
      setError('Failed to submit form. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading registration form...</p>
        </div>
      </div>
    )
  }

  if (error && !userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Link</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Go to Home
          </a>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Form Submitted!</h1>
          <p className="text-gray-600 mb-6">
            Thank you for completing your registration. A copy has been sent to your email and will be countersigned by our staff.
          </p>
          
          {pdfDownloadUrl && (
            <div className="mb-6">
              <a
                href={pdfDownloadUrl}
                download={`zumbaton-registration-${formData.fullNameNric.replace(/\s+/g, '-')}.pdf`}
                className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition mb-3"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Your Registration Form (PDF)
              </a>
              <p className="text-sm text-gray-500">Save this for your records</p>
            </div>
          )}
          
          <a
            href="/"
            className="inline-block px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#f9fafb', color: '#111827' }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block bg-black rounded-lg p-4 mb-4">
            <Image 
              src="/logo/zumbaton logo (transparent).png" 
              alt="Zumbaton Logo" 
              width={200} 
              height={80}
              priority
            />
          </div>
          <p className="text-xl" style={{ color: '#374151' }}>Membership Registration Form</p>
        </div>

        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            {/* Personal Information */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b-2 border-green-600">
                Personal Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name as in NRIC *
                  </label>
                  <input
                    type="text"
                    name="fullNameNric"
                    required
                    value={formData.fullNameNric}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Residential Address *
                  </label>
                  <textarea
                    name="residentialAddress"
                    required
                    value={formData.residentialAddress}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Postal Code *
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    required
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    required
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Handphone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender *
                  </label>
                  <select
                    name="gender"
                    required
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Not sure">Not sure</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Blood Group *
                  </label>
                  <select
                    name="bloodGroup"
                    required
                    value={formData.bloodGroup}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  >
                    <option value="">Select Blood Group</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="Not sure">Not sure</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Emergency Contact Name *
                  </label>
                  <input
                    type="text"
                    name="emergencyContact"
                    required
                    value={formData.emergencyContact}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Emergency Contact Phone *
                  </label>
                  <input
                    type="tel"
                    name="emergencyContactPhone"
                    required
                    value={formData.emergencyContactPhone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  />
                </div>
              </div>
            </section>

            {/* Parent/Guardian Section (for members aged 5-15) */}
            <section className="mb-8 p-6 bg-blue-50 border-2 border-blue-300 rounded-lg">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Parent/Guardian Information (For members aged 5-15 only)
              </h3>
              
              {/* Important Declaration */}
              <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-bold text-yellow-800 mb-2">
                      IMPORTANT: IF YOU ARE AGED BETWEEN 5 – 15, THE CONSENT OF A PARENT/GUARDIAN IS REQUIRED UPON JOINING AND A PARENT/GUARDIAN MUST BE PRESENT DURING CLASSES
                    </p>
                    <p className="text-sm text-yellow-700">
                      I am the parent/guardian of the above. I acknowledge that:
                    </p>
                    <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside space-y-1">
                      <li>The above has my express permission to participate in the ZUMBATON activities.</li>
                      <li>The above and I have read and understood the Terms and Conditions & Safety Notices.</li>
                      <li>By signing, I am agreeing to be bound along with the above by the Terms and Conditions, including Safety Notices.</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Parent/Guardian Name
                  </label>
                  <input
                    type="text"
                    name="parentGuardianName"
                    value={formData.parentGuardianName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Parent/Guardian Signature (Type your full name)
                  </label>
                  <input
                    type="text"
                    name="parentGuardianSignature"
                    value={formData.parentGuardianSignature}
                    onChange={handleInputChange}
                    placeholder="Type your full name to sign"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent italic"
                  />
                </div>
              </div>
            </section>

            {/* Terms and Conditions */}
            <section className="mb-8 p-6 bg-gray-50 rounded-lg">
              <h2 className="text-xl font-bold text-gray-900 mb-4">MEMBERSHIP TERMS & CONDITIONS</h2>
              
              <div className="max-h-[800px] overflow-y-auto p-4 bg-white rounded border-2 border-gray-400 text-sm space-y-4 mb-6 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
                <p className="font-bold text-base">MEMBER ASSUMPTION OF RISK AND RELEASE</p>
                <p>
                  I hereby understand and acknowledge the risk of injury arising from and/or in connection with ZUMBATON's activities. I willingly assume
                  all the risks associated with the exercise choreographed. I understand that ZUMBATON is independently owned and operated. I
                  HEREBY RELEASE, INDEMNIFY, AND HOLD HARMLESS to ZUMBATON's employees, owners, and partners WITH RESPECT TO
                  ANY AND ALL INJURY, DISABILITY, DEATH, LOSS OR DAMAGE to person and/or property that may arise out of or in connection with
                  my use of the studio, or otherwise related to my subscription. I expressly agree that this release is intended to be as broad and inclusive
                  as permitted by applicable law and if a portion of this release is held invalid, the balance shall remain in full force and effect.
                </p>

                <p className="font-bold text-base">IF YOU ARE AGED BETWEEN 5 – 15 THE CONSENT OF A PARENT/GUARDIAN IS REQUIRED UPON JOINING
AND A PARENT/GUARDIAN MUST BE PRESENT DURING CLASSES</p>
                <p>
                  I am the parent/guardian of the above-named Member. I acknowledge that: The above-named Member has my express permission to
                  participate in the ZUMBATON activities. The above-named Member and I have read and understood the Terms and Conditions & Safety
                  Notices. By signing, I am agreeing to be bound along with the above-named Member by the Terms and Conditions, including Safety
                  Notices.
                </p>

                <p className="font-bold text-base">1. TERMS AND CONDITIONS</p>
                <p>
                  1.1. The following terms and conditions govern the rights and obligations of ZUMBATON members thereof. It is important that you have
                  read and understood all the terms and conditions stated herein before signing this Agreement. Each member who signs below will be
                  individually and severally bound by this Agreement.
                </p>

                <p className="font-bold text-base">2. MEMBERSHIP</p>
                <p>
                  2.1. Members who are under the age of 16 years, you confirm that you have the express permission of your parent/guardian to join
                  ZUMBATON and use the facilities and services available. All references to "you" or "your" in this Agreement will denote you and/or your
                  parent/guardian on behalf of you.
                </p>
                <p>
                  2.2. Membership is personal to the member and is non-transferable and non-refundable. You may not loan or sell your membership or
                  otherwise permit it to be used by any third party. You may be charged with a fine depending on the sessions being misused.
                  ZUMBATON's management may assign the benefit of this Agreement to any person at any time with notice to the individual.
                </p>

                <p className="font-bold text-base">3. FREEZING, SUSPENSION, CANCELLATION AND/OR TERMINATION OF THE MEMBERSHIP</p>
                <p>
                  3.1. Medical Cancellation: Subject to Clause, you may cancel and/or terminate this Agreement for medical reasons. If you wish to cancel
                  and/or terminate the membership due to medical reasons, your doctor must provide the relevant certification(s) indicating that your
                  participation in ZUMBATON step aerobics activities would impair your health.
                </p>
                <p>
                  3.2. In the event of death or disability, the liability for membership will terminate as at the date of death or disability.
                </p>
                <p>
                  3.3. If the Club's facilities become temporarily unavailable due to an event such as a fire, flood, loss of lease, or the like, we may freeze
                  your membership for the period the facilities were unavailable.
                </p>
                <p>
                  3.4. Cancellation of class after booking should be made at least 24 hours before the class date. Booked class with a "NO SHOW" will be forfeited.
                </p>
                <p>
                  3.5. Zumbaton Management Team retains the sole and absolute right to cancel, freeze and/or suspend the membership of any person for
                  any reason. If such cancellation and/or suspension is made due to a breach of any of the terms of this Agreement, including the
                  Membership Policies and Safety Notices, or due to damage caused by you, the balance of your financial obligations under this
                  Agreement shall become immediately due and payable.
                </p>

                <p className="font-bold text-base">4. PHYSICAL CONDITION OF MEMBER</p>
                <p>
                  4.1. You hereby warrant and represent that you are in good physical and/or mental condition and that you know of no medical or any
                  other reason why you are not capable of engaging in active or passive exercise and that such exercise would not be detrimental to your
                  health and/or safety and/or comfort and/or physical condition.
                </p>
                <p>
                  4.2. Further, you also acknowledge that you hereby agree to carry out exercises responsibly and with due care and attention to your own
                  medical, health and mental condition at all times. You understand and acknowledge all risks of injury arising from the exercises.
                </p>

                <p className="font-bold text-base">5. ATTIRE & SAFETY</p>
                <p>
                  5.1. You are required to wear covered shoes excluding boots for all ZUMBATON sessions regardless indoors or outdoors.
                </p>
                <p>
                  5.2. It will be highly recommended to wear active sportswear & bring bottled water for water breaks & hydration purposes.
                </p>

                <p className="font-bold text-base">6. MEDIA CONSENT</p>
                <p>
                  6.1. To participate in the production of media which may be used to show image, likeness, voice, performance and visual works which
                  may be personally identifiable to the general public when published on social media.
                </p>

                <p className="font-bold text-base">PACKAGE SUBSCRIPTION TERMS</p>
                <ol className="list-decimal list-inside space-y-2 ml-4">
                  <li>Your package subscription is for your personal use and can't be transferred or shared. You must not allow anyone else to use your
                  subscription package. A Fine will be charged for any breach based on sessions misused.</li>
                  <li>Package subscription is non-refundable. Unless, if there is a medical reason. In such case the following documentary proof must be
                  provided and it will be subject to approval by the management:
                    <br />a) Medical – A doctor from a Singapore hospital provides a letter indicating that aerobics / Step aerobics will seriously impair my health.
                  If the following documents are approved by management, the subscriptions will be on hold till you are deemed fit to continue.</li>
                  <li>You confirmed that you have no pre-existing medical conditions which would prevent you from engaging in active exercise and you
                  agree to undertake the lessons within your fitness limits.</li>
                  <li>If you are below 16 years old. You are required to bring along a Parent / Guardian on the registration date.</li>
                  <li>Cancellation of class after booking must be made 24 hours before the class date.</li>
                  <li>Booking timing is open from 0800H – 2200H daily VIA website.</li>
                  <li>Booked class with a "NO SHOW" will be forfeited.</li>
                  <li>You acknowledge that you fully take responsibility of all risk of injuries arising from the aerobics and Step aerobics classes and not hold
                  the trainers or management for any liability for any injury arising from the classes.</li>
                  <li>You will be liable for the medical expenses in cases where there is a personal injury during classes.</li>
                  <li>An e-copy of the terms and conditions will be sent to your email address. This letter of acceptance supplements the agreement.</li>
                </ol>

                <p className="font-bold text-base">I HAVE READ THE MEMBERSHIP TERMS AND CONDITIONS AGREEMENT, FULLY UNDERSTAND ITS TERMS
AND THAT I HAVE GIVEN UP SUBSTANTIAL RIGHTS BY SIGNING IT, AND SIGN IT FREELY AND VOLUNTARILY
WITHOUT ANY INDUCEMENT</p>
                <p>
                  I hereby confirm that I am aware of and agree to the terms and conditions on both the front and attached pages of this document headed
                  'Terms & Conditions'.
                </p>
              </div>

              <div className="flex items-start mb-6">
                <input
                  type="checkbox"
                  name="termsAccepted"
                  checked={formData.termsAccepted}
                  onChange={handleInputChange}
                  className="mt-1 h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  required
                />
                <label className="ml-3 text-sm text-gray-700">
                  I have read and agree to the Terms and Conditions, and I acknowledge that I have given up substantial 
                  rights by signing this agreement. I sign it freely and voluntarily without any inducement. *
                </label>
              </div>

              <div className="flex items-start mb-6">
                <input
                  type="checkbox"
                  name="mediaConsent"
                  checked={formData.mediaConsent}
                  onChange={handleInputChange}
                  className="mt-1 h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  required
                />
                <label className="ml-3 text-sm text-gray-700">
                  <strong>Media Consent:</strong> I consent to participate in the production of media which may be used to show my image, 
                  likeness, voice, performance and visual works which may be personally identifiable to the general public when 
                  published on social media. *
                </label>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg border-2 border-yellow-400">
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  ✍️ Member Signature (Type your full name) *
                </label>
                <input
                  type="text"
                  name="memberSignature"
                  required
                  value={formData.memberSignature}
                  onChange={handleInputChange}
                  placeholder="Type your FULL NAME here to sign"
                  className="w-full px-4 py-3 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 italic text-xl font-semibold"
                />
                <p className="mt-2 text-sm text-gray-700 font-medium">
                  ⚠️ By typing your name above, you are providing your legal electronic signature.
                </p>
                {formData.memberSignature.trim() && formData.memberSignature.trim().length < 3 && (
                  <p className="mt-1 text-sm text-red-600 font-medium">
                    Please enter your complete full name
                  </p>
                )}
              </div>
            </section>

            {/* Submit Button / PDF Download Section */}
            {!showPdfPreview ? (
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting || !isFormValid()}
                  className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-800 text-white font-bold rounded-lg 
                           hover:from-green-700 hover:to-green-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Generating PDF...' : 'Review & Download PDF'}
                </button>
                {!isFormValid() && !submitting && (
                  <p className="ml-4 text-sm text-red-600 flex items-center">
                    Please fill all required fields (*) and provide your signature
                  </p>
                )}
              </div>
            ) : (
              <div className="bg-purple-50 p-6 rounded-lg border-2 border-purple-400">
                <h3 className="text-lg font-bold text-purple-900 mb-4">
                  📄 Your Registration Form is Ready!
                </h3>
                <p className="text-sm text-gray-700 mb-4">
                  Please download and review your registration form before final submission.
                </p>
                
                {pdfDownloadUrl && (
                  <div className="flex gap-4 mb-4">
                    <a
                      href={pdfDownloadUrl}
                      download="Zumbaton_Registration_Form.pdf"
                      className="flex-1 px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition text-center"
                    >
                      📥 Download PDF
                    </a>
                  </div>
                )}

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPdfPreview(false)
                      setPdfGenerated(false)
                      if (pdfDownloadUrl) {
                        URL.revokeObjectURL(pdfDownloadUrl)
                        setPdfDownloadUrl(null)
                      }
                    }}
                    className="flex-1 px-6 py-3 bg-gray-300 text-gray-800 font-bold rounded-lg hover:bg-gray-400 transition"
                  >
                    ← Edit Form
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-800 text-white font-bold rounded-lg 
                             hover:from-green-700 hover:to-green-900 transition disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : '✓ Confirm & Submit'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
