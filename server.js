// server.js
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const twilio = require('twilio');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_TOKEN;
const twilioNumber = process.env.TWILIO_PHONE;
const client = twilio(accountSid, authToken);

const otpStore = {};

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

app.post('/send-otp', async (req, res) => {
  const { phone } = req.body;
  const otp = generateOTP();
  otpStore[phone] = otp;

  try {
    await client.messages.create({
      body: `รหัส OTP ของคุณคือ: ${otp}`,
      from: twilioNumber,
      to: phone,
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/verify-otp', (req, res) => {
  const { phone, otp } = req.body;
  if (otpStore[phone] === otp) {
    delete otpStore[phone];
    res.json({ success: true, message: "ยืนยันสำเร็จ!" });
  } else {
    res.json({ success: false, message: "รหัสไม่ถูกต้อง หรือหมดอายุ" });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));