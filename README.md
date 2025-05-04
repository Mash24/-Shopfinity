# Shopfinity - Modern eCommerce Marketplace

![Shopfinity Logo](https://placeholder.svg?height=100\&width=300\&text=Shopfinity)

**Shopfinity** is a modern, fully functional eCommerce web application that enables users to **buy and sell** both **new and second-hand items**. With a seamless UI and robust backend, users can list items, manage listings, explore product categories, and securely checkout with ease. Built with a mobile-first approach, Shopfinity ensures excellent performance and user experience across all devices.

---

## 🌟 Features

* 🔐 **User Authentication**: Secure email/password login powered by Supabase Auth
* 📦 **Product Listings**: Create, edit, and delete listings with multi-image upload support
* 🛒 **Shopping Cart**: Add to cart, update quantity, and checkout with ease
* 📂 **User Dashboard**: Manage your listed items, purchases, and personal settings
* 🔍 **Category Filtering**: Filter by category, item condition (new/used/refurbished), and price range
* 🖼️ **Image Upload**: Upload multiple product images and choose a primary image
* 💡 **Single Account**: Seamlessly switch between buyer and seller mode
* 🌍 **Global Reach**: Designed for worldwide use with support for multiple locations
* 📱 **Responsive Design**: Works beautifully on desktop, tablet, and mobile screens

---

## 🛠️ Technologies Used

### Frontend

* **React.js** – Core library for building UI components
* **Next.js** – SSR & routing framework for better SEO and performance
* **TailwindCSS** – Utility-first CSS for fast and consistent styling
* **shadcn/ui** – Reusable component library based on Radix UI
* **Lucide Icons** – Beautiful and consistent icon set

### Backend & Database

* **Supabase** – All-in-one backend platform

  * 🔐 Authentication (email/password)
  * 🗄️ PostgreSQL database
  * 🖼️ Storage (for product images)
  * 🔐 RLS (Row Level Security) policies

### Utilities & State Management

* **React Context API** – Auth and cart state management
* **Server Actions** – Handle protected and async data operations
* **Middleware** – Auth guarding and route protection

---

## 🚀 Setup and Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Mash24/shopfinity.git
   cd shopfinity
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root and include:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

   Visit [http://localhost:3000](http://localhost:3000) to view the app.

---

## 📁 Folder Structure Highlights

```
shopfinity/
├── app/                  # All pages (routes)
├── components/           # Reusable UI components
├── lib/                  # Supabase client, utils
├── public/               # Static assets
├── styles/               # Global styles (Tailwind)
└── .env.local            # Local environment variables
```

---

## 🔐 Security Notice

Your Supabase **anon key** should be kept secure even though it's used client-side. Never expose your **service role** key on the frontend.

---

## 📸 Screenshots

> Coming soon! Want help capturing and embedding visuals?

---

## 🤝 Contributing

Coming soon! Want to help improve Shopfinity? Contributions will be open to the community.

---

## 📄 License

This project will be licensed under the MIT License. (Add LICENSE file soon)

---

> Built with ❤️ using React, Supabase, and TailwindCSS.