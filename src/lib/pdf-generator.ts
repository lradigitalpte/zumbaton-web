/**
 * PDF Generator for Registration Forms
 * Creates formatted PDF with all form data and signatures
 */

import { jsPDF } from 'jspdf'
import fs from 'fs'
import path from 'path'

export interface RegistrationFormData {
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
  parentGuardianName?: string
  parentGuardianSignature?: string
  parentGuardianDate?: string
  memberSignature: string
  memberSignatureDate: string
  mediaConsent: boolean
  termsAccepted: boolean
  staffName?: string
  staffSignature?: string
  staffSignatureDate?: string
  submittedAt: string
}

export async function generateRegistrationFormPDF(formData: RegistrationFormData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      let y = 15 // Current Y position (reduced to make room for logo)

      // Add Logo - using optimized logo fav.png (76KB)
      try {
        const logoPath = path.join(process.cwd(), 'public', 'logo', 'logo fav.png')
        
        if (fs.existsSync(logoPath)) {
          const logoBuffer = fs.readFileSync(logoPath)
          const logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`
          
          // Add logo centered at top (25mm width, 25mm height to maintain square aspect ratio)
          doc.addImage(logoBase64, 'PNG', 92.5, y, 25, 25)
          y += 30 // Move down after logo
        } else {
          console.log('[PDF] Logo file not found at:', logoPath)
          // Fallback: Use text header
          doc.setFontSize(24)
          doc.setTextColor(22, 163, 74)
          doc.setFont('helvetica', 'bold')
          doc.text('ZUMBATON', 105, y + 5, { align: 'center' })
          y += 15
        }
      } catch (error) {
        console.error('[PDF] Error loading logo:', error)
        // Fallback: Use text header
        doc.setFontSize(24)
        doc.setTextColor(22, 163, 74)
        doc.setFont('helvetica', 'bold')
        doc.text('ZUMBATON', 105, y + 5, { align: 'center' })
        y += 15
      }

      // Remove the old text-based header that was here before
      
      // Subtitle below logo
      
      doc.setFontSize(16)
      doc.setTextColor(0, 0, 0)
      doc.text('Membership Registration Form', 105, y, { align: 'center' })
      y += 6
      
      doc.setFontSize(10)
      doc.setTextColor(102, 102, 102)
      doc.text(`Submitted: ${new Date(formData.submittedAt).toLocaleDateString('en-SG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}`, 105, y, { align: 'center' })
      y += 15

      // Personal Information Section
      doc.setFontSize(14)
      doc.setTextColor(22, 163, 74)
      doc.setFont('helvetica', 'bold')
      doc.text('PERSONAL INFORMATION', 20, y)
      y += 8
      
      doc.setFontSize(10)
      doc.setTextColor(0, 0, 0)
      doc.setFont('helvetica', 'normal')
      
      y = addField(doc, y, 'Full Name as in NRIC:', formData.fullNameNric)
      y = addField(doc, y, 'Residential Address:', formData.residentialAddress)
      y = addField(doc, y, 'Postal Code:', formData.postalCode)
      y = addField(doc, y, 'Date of Birth:', new Date(formData.dateOfBirth).toLocaleDateString('en-SG'))
      y = addField(doc, y, 'Email Address:', formData.email)
      y = addField(doc, y, 'Handphone Number:', formData.phone)
      y = addField(doc, y, 'Gender:', formData.gender)
      y = addField(doc, y, 'Blood Group:', formData.bloodGroup)
      y += 8

      // Emergency Contact Section
      doc.setFontSize(14)
      doc.setTextColor(22, 163, 74)
      doc.setFont('helvetica', 'bold')
      doc.text('EMERGENCY CONTACT', 20, y)
      y += 8
      
      doc.setFontSize(10)
      doc.setTextColor(0, 0, 0)
      doc.setFont('helvetica', 'normal')
      
      y = addField(doc, y, 'Emergency Contact Name:', formData.emergencyContact)
      y = addField(doc, y, 'Emergency Contact Phone:', formData.emergencyContactPhone)
      y += 8

      // Parent/Guardian Section (if applicable)
      if (formData.parentGuardianName || formData.parentGuardianSignature) {
        doc.setFontSize(14)
        doc.setTextColor(22, 163, 74)
        doc.setFont('helvetica', 'bold')
        doc.text('PARENT/GUARDIAN INFORMATION', 20, y)
        y += 5
        
        doc.setFontSize(9)
        doc.setTextColor(102, 102, 102)
        doc.setFont('helvetica', 'italic')
        doc.text('(For members aged 5-15 only)', 20, y)
        y += 6
        
        doc.setFontSize(10)
        doc.setTextColor(0, 0, 0)
        doc.setFont('helvetica', 'normal')
        
        if (formData.parentGuardianName) {
          y = addField(doc, y, 'Parent/Guardian Name:', formData.parentGuardianName)
        }
        if (formData.parentGuardianSignature) {
          y = addField(doc, y, 'Parent/Guardian Signature:', formData.parentGuardianSignature)
          if (formData.parentGuardianDate) {
            y = addField(doc, y, 'Date:', new Date(formData.parentGuardianDate).toLocaleDateString('en-SG'))
          }
        }
        y += 8
      }

      // Add new page for terms
      doc.addPage()
      y = 20

      // Terms and Conditions Section - Page 2
      doc.setFontSize(14)
      doc.setTextColor(22, 163, 74)
      doc.setFont('helvetica', 'bold')
      doc.text('MEMBERSHIP TERMS & CONDITIONS', 105, y, { align: 'center' })
      y += 10

      doc.setFontSize(10)
      doc.setTextColor(0, 0, 0)
      doc.setFont('helvetica', 'bold')
      doc.text('MEMBER ASSUMPTION OF RISK AND RELEASE', 20, y)
      y += 6
      
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      const riskText = 'I hereby understand and acknowledge the risk of injury arising from and/or in connection with ZUMBATON\'s activities. I willingly assume all the risks associated with the exercise choreographed. I understand that ZUMBATON is independently owned and operated. I HEREBY RELEASE, INDEMNIFY, AND HOLD HARMLESS to ZUMBATON\'s employees, owners, and partners WITH RESPECT TO ANY AND ALL INJURY, DISABILITY, DEATH, LOSS OR DAMAGE to person and/or property that may arise out of or in connection with my use of the studio, or otherwise related to my subscription. I expressly agree that this release is intended to be as broad and inclusive as permitted by applicable law and if a portion of this release is held invalid, the balance shall remain in full force and effect.'
      const riskLines = doc.splitTextToSize(riskText, 170)
      doc.text(riskLines, 20, y)
      y += riskLines.length * 3.5 + 5

      // Parent/Guardian Notice
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      const parentNotice = 'IF YOU ARE AGED BETWEEN 5 – 15 THE CONSENT OF A PARENT/GUARDIAN IS REQUIRED UPON JOINING AND A PARENT/GUARDIAN MUST BE PRESENT DURING CLASSES'
      const parentNoticeLines = doc.splitTextToSize(parentNotice, 170)
      doc.text(parentNoticeLines, 20, y)
      y += parentNoticeLines.length * 3.5 + 4

      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      const parentConsent = 'I am the parent/guardian of the above-named Member. I acknowledge that: The above-named Member has my express permission to participate in the ZUMBATON activities. The above-named Member and I have read and understood the Terms and Conditions & Safety Notices. By signing, I am agreeing to be bound along with the above-named Member by the Terms and Conditions, including Safety Notices.'
      const parentConsentLines = doc.splitTextToSize(parentConsent, 170)
      doc.text(parentConsentLines, 20, y)
      y += parentConsentLines.length * 3.5 + 5

      // Section 1: TERMS AND CONDITIONS
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.text('1. TERMS AND CONDITIONS', 20, y)
      y += 4
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      const terms11 = '1.1. The following terms and conditions govern the rights and obligations of ZUMBATON members thereof. It is important that you have read and understood all the terms and conditions stated herein before signing this Agreement. Each member who signs below will be individually and severally bound by this Agreement.'
      const terms11Lines = doc.splitTextToSize(terms11, 170)
      doc.text(terms11Lines, 20, y)
      y += terms11Lines.length * 3.5 + 4

      // Section 2: MEMBERSHIP
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.text('2. MEMBERSHIP', 20, y)
      y += 4
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      const terms21 = '2.1. Members who are under the age of 16 years, you confirm that you have the express permission of your parent/guardian to join ZUMBATON and use the facilities and services available. All references to "you" or "your" in this Agreement will denote you and/or your parent/guardian on behalf of you.'
      const terms21Lines = doc.splitTextToSize(terms21, 170)
      doc.text(terms21Lines, 20, y)
      y += terms21Lines.length * 3.5 + 3

      const terms22 = '2.2. Membership is personal to the member and is non-transferable and non-refundable. You may not loan or sell your membership or otherwise permit it to be used by any third party. You may be charged with a fine depending on the sessions being misused. ZUMBATON\'s management may assign the benefit of this Agreement to any person at any time with notice to the individual.'
      const terms22Lines = doc.splitTextToSize(terms22, 170)
      doc.text(terms22Lines, 20, y)
      y += terms22Lines.length * 3.5 + 4

      // Section 3: FREEZING, SUSPENSION, CANCELLATION
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.text('3. FREEZING, SUSPENSION, CANCELLATION AND/OR TERMINATION OF THE MEMBERSHIP', 20, y)
      y += 4
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      
      const terms31 = '3.1. Medical Cancellation: Subject to Clause, you may cancel and/or terminate this Agreement for medical reasons. If you wish to cancel and/or terminate the membership due to medical reasons, your doctor must provide the relevant certification(s) indicating that your participation in ZUMBATON step aerobics activities would impair your health.'
      const terms31Lines = doc.splitTextToSize(terms31, 170)
      doc.text(terms31Lines, 20, y)
      y += terms31Lines.length * 3.5 + 3

      const terms32 = '3.2. In the event of death or disability, the liability for membership will terminate as at the date of death or disability.'
      const terms32Lines = doc.splitTextToSize(terms32, 170)
      doc.text(terms32Lines, 20, y)
      y += terms32Lines.length * 3.5 + 3

      const terms33 = '3.3. If the Club\'s facilities become temporarily unavailable due to an event such as a fire, flood, loss of lease, or the like, we may freeze your membership for the period the facilities were unavailable.'
      const terms33Lines = doc.splitTextToSize(terms33, 170)
      doc.text(terms33Lines, 20, y)
      y += terms33Lines.length * 3.5 + 3

      doc.text('3.4. Cancellation of class after booking should be made at least 24 hours before the class date. Booked class with a "NO SHOW" will be forfeited.', 20, y)
      y += 7

      // Add new page for remaining terms
      doc.addPage()
      y = 20

      const terms35 = '3.5. Zumbaton Management Team retains the sole and absolute right to cancel, freeze and/or suspend the membership of any person for any reason. If such cancellation and/or suspension is made due to a breach of any of the terms of this Agreement, including the Membership Policies and Safety Notices, or due to damage caused by you, the balance of your financial obligations under this Agreement shall become immediately due and payable.'
      const terms35Lines = doc.splitTextToSize(terms35, 170)
      doc.text(terms35Lines, 20, y)
      y += terms35Lines.length * 3.5 + 4

      // Section 4: PHYSICAL CONDITION
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.text('4. PHYSICAL CONDITION OF MEMBER', 20, y)
      y += 4
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      
      const terms41 = '4.1. You hereby warrant and represent that you are in good physical and/or mental condition and that you know of no medical or any other reason why you are not capable of engaging in active or passive exercise and that such exercise would not be detrimental to your health and/or safety and/or comfort and/or physical condition.'
      const terms41Lines = doc.splitTextToSize(terms41, 170)
      doc.text(terms41Lines, 20, y)
      y += terms41Lines.length * 3.5 + 3

      const terms42 = '4.2. Further, you also acknowledge that you hereby agree to carry out exercises responsibly and with due care and attention to your own medical, health and mental condition at all times. You understand and acknowledge all risks of injury arising from the exercises.'
      const terms42Lines = doc.splitTextToSize(terms42, 170)
      doc.text(terms42Lines, 20, y)
      y += terms42Lines.length * 3.5 + 4

      // Section 5: ATTIRE & SAFETY
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.text('5. ATTIRE & SAFETY', 20, y)
      y += 4
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.text('5.1. You are required to wear covered shoes excluding boots for all ZUMBATON sessions regardless indoors or outdoors.', 20, y)
      y += 7
      doc.text('5.2. It will be highly recommended to wear active sportswear & bring bottled water for water breaks & hydration purposes.', 20, y)
      y += 7

      // Section 6: MEDIA CONSENT
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.text('6. MEDIA CONSENT', 20, y)
      y += 4
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      const mediaText = '6.1. To participate in the production of media which may be used to show image, likeness, voice, performance and visual works which may be personally identifiable to the general public when published on social media.'
      const mediaTextLines = doc.splitTextToSize(mediaText, 170)
      doc.text(mediaTextLines, 20, y)
      y += mediaTextLines.length * 3.5 + 6

      // Package Subscription Terms
      doc.setFontSize(11)
      doc.setTextColor(22, 163, 74)
      doc.setFont('helvetica', 'bold')
      doc.text('PACKAGE SUBSCRIPTION TERMS', 20, y)
      y += 6

      doc.setFontSize(8)
      doc.setTextColor(0, 0, 0)
      doc.setFont('helvetica', 'normal')
      
      const packageTerms = [
        '1. Your package subscription is for your personal use and can\'t be transferred or shared. You must not allow anyone else to use your subscription package. A Fine will be charged for any breach based on sessions misused.',
        '2. Package subscription is non-refundable. Unless, if there is a medical reason. In such case the following documentary proof must be provided and it will be subject to approval by the management:\n   a) Medical – A doctor from a Singapore hospital provides a letter indicating that Zumba / Step aerobics will seriously impair my health. If the following documents are approved by management, the subscriptions will be on hold till you are deemed fit to continue.',
        '3. You confirmed that you have no pre-existing medical conditions which would prevent you from engaging in active exercise and you agree to undertake the lessons within your fitness limits.',
        '4. If you are below 16 years old. You are required to bring along a Parent / Guardian on the registration date.',
        '5. Cancellation of class after booking must be made 24 hours before the class date.',
        '6. Booking timing is open from 0800H – 2200H daily VIA website.',
        '7. Booked class with a "NO SHOW" will be forfeited.',
        '8. You acknowledge that you fully take responsibility of all risk of injuries arising from the Zumba and Step aerobics classes and not hold the trainers or management for any liability for any injury arising from the classes.',
        '9. You will be liable for the medical expenses in cases where there is a personal injury during classes.',
        '10. An e-copy of the terms and conditions will be sent to your email address. This letter of acceptance supplements the agreement.'
      ]

      packageTerms.forEach(term => {
        const termLines = doc.splitTextToSize(term, 170)
        doc.text(termLines, 20, y)
        y += termLines.length * 3.5 + 3
      })

      y += 4

      // Add new page for declaration and signatures
      doc.addPage()
      y = 20

      // Declaration
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      const declaration1 = 'I HAVE READ THE MEMBERSHIP TERMS AND CONDITIONS AGREEMENT, FULLY UNDERSTAND ITS TERMS AND THAT I HAVE GIVEN UP SUBSTANTIAL RIGHTS BY SIGNING IT, AND SIGN IT FREELY AND VOLUNTARILY WITHOUT ANY INDUCEMENT'
      const declaration1Lines = doc.splitTextToSize(declaration1, 170)
      doc.text(declaration1Lines, 20, y)
      y += declaration1Lines.length * 3.5 + 5

      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      const declaration2 = 'I hereby confirm that I am aware of and agree to the terms and conditions on both the front and attached pages of this document headed \'Terms & Conditions\'.'
      const declaration2Lines = doc.splitTextToSize(declaration2, 170)
      doc.text(declaration2Lines, 20, y)
      y += declaration2Lines.length * 3.5 + 8

      // Consents Section
      doc.setFontSize(12)
      doc.setTextColor(22, 163, 74)
      doc.setFont('helvetica', 'bold')
      doc.text('CONSENTS & ACKNOWLEDGMENTS', 20, y)
      y += 8
      
      doc.setFontSize(10)
      doc.setTextColor(0, 0, 0)
      doc.setFont('helvetica', 'normal')
      
      y = addCheckbox(doc, y, 'Terms & Conditions Accepted', formData.termsAccepted)
      doc.setFontSize(8)
      doc.setTextColor(102, 102, 102)
      const termsConsentText = 'I have read and agree to the Terms and Conditions, and I acknowledge that I have given up substantial rights by signing this agreement.'
      const termsConsentLines = doc.splitTextToSize(termsConsentText, 155)
      doc.text(termsConsentLines, 30, y)
      y += termsConsentLines.length * 3.5 + 4

      doc.setFontSize(10)
      doc.setTextColor(0, 0, 0)
      y = addCheckbox(doc, y, 'Media Consent', formData.mediaConsent)
      doc.setFontSize(8)
      doc.setTextColor(102, 102, 102)
      const mediaConsentText = 'I consent to participate in the production of media which may be used to show my image, likeness, voice, performance and visual works.'
      const mediaConsentLines = doc.splitTextToSize(mediaConsentText, 155)
      doc.text(mediaConsentLines, 30, y)
      y += mediaConsentLines.length * 3.5 + 8

      // Signatures Section
      doc.setFontSize(12)
      doc.setTextColor(22, 163, 74)
      doc.setFont('helvetica', 'bold')
      doc.text('SIGNATURES', 20, y)
      y += 8
      
      doc.setFontSize(10)
      doc.setTextColor(0, 0, 0)
      doc.setFont('helvetica', 'normal')

      // Member Signature
      y = addSignatureBox(doc, y, 'Member Signature:', formData.memberSignature, formData.memberSignatureDate)
      y += 8

      // Staff Signature (if present)
      if (formData.staffSignature) {
        y = addSignatureBox(doc, y, 'Staff Signature:', formData.staffSignature, formData.staffSignatureDate || '')
        if (formData.staffName) {
          doc.setFontSize(9)
          doc.setTextColor(102, 102, 102)
          doc.text(`Staff Name: ${formData.staffName}`, 30, y)
          y += 5
        }
      } else {
        doc.setFontSize(9)
        doc.setTextColor(153, 153, 153)
        doc.text('Staff Signature: [Pending]', 20, y)
        y += 4
        doc.setFontSize(8)
        doc.setFont('helvetica', 'italic')
        doc.text('(To be signed by Zumbaton staff)', 20, y)
      }

      // Footer
      y = 280
      doc.setFontSize(8)
      doc.setTextColor(153, 153, 153)
      doc.setFont('helvetica', 'normal')
      doc.text('This is a computer-generated document. For verification, please contact Zumbaton administration.', 105, y, { align: 'center' })

      // Convert to Buffer
      const pdfData = doc.output('arraybuffer')
      const pdfBuffer = Buffer.from(pdfData)
      resolve(pdfBuffer)
    } catch (error) {
      console.error('[PDF Generation] Error:', error)
      reject(error)
    }
  })
}

function addField(doc: jsPDF, y: number, label: string, value: string): number {
  doc.setFontSize(9)
  doc.setTextColor(102, 102, 102)
  doc.setFont('helvetica', 'normal')
  doc.text(label, 20, y)
  
  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'bold')
  doc.text(value, 80, y)
  
  return y + 6
}

function addCheckbox(doc: jsPDF, y: number, label: string, checked: boolean): number {
  const x = 20
  
  // Draw checkbox with thicker border
  doc.setDrawColor(0, 0, 0)
  doc.setLineWidth(0.8)
  doc.rect(x, y - 3, 5, 5)
  
  if (checked) {
    // Draw a bold checkmark using lines instead of text
    doc.setLineWidth(1.2)
    doc.setDrawColor(22, 163, 74) // Green color for checkmark
    
    // Draw checkmark as two lines forming a check
    // First line: bottom-left to middle
    doc.line(x + 1, y - 0.5, x + 2, y + 1)
    // Second line: middle to top-right
    doc.line(x + 2, y + 1, x + 4, y - 2)
    
    doc.setDrawColor(0, 0, 0) // Reset to black
  }
  
  // Draw label
  doc.setFontSize(10)
  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'bold')
  doc.text(label, x + 9, y)
  
  return y + 6
}

function addSignatureBox(doc: jsPDF, y: number, label: string, signature: string, date: string): number {
  doc.setFontSize(10)
  doc.setTextColor(102, 102, 102)
  doc.setFont('helvetica', 'normal')
  doc.text(label, 20, y)
  y += 6
  
  const x = 30
  
  // Signature box
  doc.setDrawColor(0, 0, 0)
  doc.setLineWidth(0.5)
  doc.rect(x, y, 80, 15)
  
  doc.setFontSize(14)
  doc.setFont('helvetica', 'italic')
  doc.setTextColor(0, 0, 0)
  doc.text(signature, x + 4, y + 10)
  doc.setFont('helvetica', 'normal')
  
  y += 18
  doc.setFontSize(8)
  doc.setTextColor(102, 102, 102)
  doc.text(`Date: ${new Date(date).toLocaleDateString('en-SG')}`, x, y)
  
  return y + 4
}
