# LandHive MongoDB Schema Reference

Database: `landhive`  
Connection: `LH_MONGODB_URI`

---

## Collections

### `listings`
Core property listing document.

```json
{
  "_id": "ObjectId",
  "userId": "clerk_user_id",
  "title": "string",
  "landType": "agricultural | residential | commercial | industrial | farm | house | plot",
  "area": { "value": 5.0, "unit": "acre | cent | sqft | gunta" },
  "surveyNumber": "string",
  "price": { "total": 3500000, "perAcre": 700000 },
  "description": "string",
  "location": {
    "state": "Tamil Nadu",
    "district": "Coimbatore",
    "village": "Sulur",
    "landmark": "string",
    "lat": 10.9254,
    "lng": 77.0131
  },
  "photos": ["url"],
  "documents": ["url"],
  "seller": {
    "userId": "clerk_user_id",
    "name": "string",
    "email": "string",
    "phone": "string",
    "whatsapp": "string"
  },
  "kyc": {
    "status": "pending | verified | rejected",
    "aadhaarName": "string",
    "aadhaarNumber": "XXXXXXXXXXXX",
    "panNumber": "ABCDE1234F",
    "submittedAt": "ISODate",
    "verifiedAt": "ISODate | null",
    "rejectedAt": "ISODate | null",
    "rejectedReason": "string | null"
  },
  "payment": {
    "status": "pending | paid | failed",
    "txnid": "LH1234567890ABCD",
    "mihpayid": "403993715529",
    "amount": 2499,
    "mode": "UPI | CC | DC | NB",
    "paidAt": "ISODate | null"
  },
  "listingFee": 2499,
  "status": "pending | awaiting_payment | pending_kyc | approved | rejected | expired",
  "verified": false,
  "kycVerified": false,
  "featured": false,
  "viewCount": 0,
  "inquiryCount": 0,
  "expiresAt": "ISODate",
  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}
```

---

### `payments`
Full PayU transaction record — every payment attempt is stored.

```json
{
  "_id": "ObjectId",
  "txnid": "LH1741234567890ABCD",
  "mihpayid": "403993715529",
  "userId": "clerk_user_id",
  "listingId": "ObjectId string",
  "productinfo": "LandHive Listing Fee",
  "firstname": "Suresh Kumar",
  "email": "suresh@example.com",
  "phone": "9876543210",
  "amount": 2499,
  "currency": "INR",
  "status": "initiated | success | failure | pending",
  "udf1": "listingId",
  "udf2": "clerkUserId",
  "paymentMode": "UPI | CC | DC | NB | EMI | CASH",
  "bankCode": "ICIC",
  "bankRefNum": "123456789012",
  "cardNum": "************1234",
  "nameOnCard": "SURESH KUMAR",
  "issuingBank": "ICICI BANK",
  "errorCode": null,
  "errorMessage": null,
  "payuHash": "sha512_hash_sent_to_payu",
  "responseHash": "sha512_hash_from_payu",
  "hashValid": true,
  "rawResponse": {},
  "initiatedAt": "ISODate",
  "completedAt": "ISODate | null",
  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}
```

---

### `users`
Extended user profile linked to Clerk.

```json
{
  "_id": "ObjectId",
  "clerkId": "user_2abc...",
  "name": "string",
  "email": "string",
  "phone": "string",
  "role": "buyer | seller | admin",
  "kycStatus": "none | pending | verified | rejected",
  "totalPaid": 9999,
  "totalListings": 2,
  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}
```

---

### `inquiries`
Buyer inquiries sent to sellers.

```json
{
  "_id": "ObjectId",
  "listingId": "ObjectId string",
  "sellerId": "clerk_user_id",
  "buyerId": "clerk_user_id",
  "buyerName": "string",
  "buyerPhone": "string",
  "buyerEmail": "string",
  "message": "string",
  "status": "new | contacted | closed",
  "createdAt": "ISODate"
}
```

---

## Environment Variables Required

| Variable | Purpose |
|---|---|
| `LH_MONGODB_URI` | MongoDB Atlas connection string |
| `CLERK_SECRET_KEY` | Clerk backend auth |
| `RESEND_API_KEY` | Email via Resend |
| `RESEND_FROM_EMAIL` | Sender email (`hello@landhive.in`) |
| `PAYU_MERCHANT_KEY` | PayU merchant key |
| `PAYU_MERCHANT_SALT` | PayU salt for hash generation |
| `APP_URL` | App base URL (`https://landhive.in`) |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk frontend key |
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps |
