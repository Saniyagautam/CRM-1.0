#  AI-Powered CRM Platform

A smart CRM web application to manage customers, create dynamic campaigns, track deliveries, and engage users effectively. Includes integrated AI capabilities for message generation and natural language rule translation.

---

## ✨ Features

### 👥 **Customer Management**
- View customer list
- Add new customers with details (name, email, contact info)

### 📦 **Order Management**
- View list of orders
- Add new orders with shipping and payment details

### 📣 **Campaigns**
- Define audience segments using natural language  
  _e.g., "People who haven't ordered in 6 months and spent over ₹5000"_
- Logical rule builder with **AND/OR** conditions
- Preview audience size before saving
- View campaign history with delivery stats (sent, failed, audience size)

### 🤖 **AI Integration (Grok AI)**
- Convert **natural language audience descriptions** into logical filter rules
- Auto-generate campaign **message suggestions** based on campaign goals

### 🚚 **Campaign Delivery & Logging**
- Sends personalized messages to each customer via dummy vendor API
- Simulates real-world delivery
- Logs delivery receipts and updates status in the database

### 🔐 **Authentication**
- Secure **Google OAuth 2.0** login
- Only authenticated users can manage campaigns or view logs

---

## 📦 Tech Stack

- **Frontend**: React, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: Google OAuth 2.0
- **AI Integration**: Grok AI 

---

## 🚀 Installation

### 1. Clone the repository


git clone https://github.com/Saniyagautam/CRM-1.0

### 2. For Frontend

cd frontend
npm install
npm start

### 3. For Backend
cd backend
npm install
npm start


## 📸 Screenshots

### 🏠 Dashboard Overview
<p align="center">
  <img src="https://github.com/Saniyagautam/CRM-1.0/blob/main/frontend/public/dashboard.png?raw=true" width="600"/>
</p>

---

### ➕ Add Customer & ➕ Add Order
<p align="center">
  <img src="https://github.com/Saniyagautam/CRM-1.0/blob/main/frontend/public/add%20customer.png?raw=true" width="300"/>
  &nbsp;&nbsp;
  <img src="https://github.com/Saniyagautam/CRM-1.0/blob/main/frontend/public/add%20order.png?raw=true" width="300"/>
</p>

---

### 📦 Orders Page
<p align="center">
  <img src="https://github.com/Saniyagautam/CRM-1.0/blob/main/frontend/public/otrders.png?raw=true" width="600"/>
</p>

---

### 📣 Campaigns & 📋 Campaign Logs
<p align="center">
  <img src="https://github.com/Saniyagautam/CRM-1.0/blob/main/frontend/public/campaigns.png?raw=true" width="300"/>
  &nbsp;&nbsp;
  <img src="https://github.com/Saniyagautam/CRM-1.0/blob/main/frontend/public/campaign%20logs.png?raw=true" width="300"/>
</p>

---

### 🔐 Google Authentication
<p align="center">
  <img src="https://github.com/Saniyagautam/CRM-1.0/blob/main/frontend/public/google%20authentication.png?raw=true" width="600"/>
</p>
