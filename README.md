# Digital Menu Management System

A full-stack application for managing restaurant menus and allowing customers to view them digitally. Built with the T3 Stack (Next.js, tRPC, Prisma, Tailwind CSS).

## 🚀 Deployed Application
**[INSERT YOUR VERCEL DEPLOYMENT LINK HERE]**

## 🛠️ Tech Stack
- **Framework:** Next.js (App Router & Pages Router mixed, T3 Stack)
- **Language:** TypeScript
- **Styling:** Tailwind CSS, shadcn/ui
- **Database:** PostgreSQL (Neon)
- **ORM:** Prisma
- **API:** tRPC
- **Authentication:** Custom Email/OTP (JWT-based)

## 💡 Approach
The project was built with a focus on type safety and user experience.
1.  **Database First**: Designed the schema (`User`, `Restaurant`, `Category`, `Dish`) to ensure data integrity.
2.  **Type-Safe API**: Used tRPC to connect the frontend and backend with full type inference, reducing runtime errors.
3.  **Component-Driven UI**: Leveraged `shadcn/ui` for accessible and consistent components.
4.  **Mobile-First Design**: The public menu is optimized for mobile devices, featuring sticky navigation and a floating menu button.

## 💻 IDE Used
VS Code

## 🤖 AI Tools & Models Used
- **Agent:** Google DeepMind's Advanced Agentic Coding Assistant
- **Model:** Gemini 1.5 Pro / Flash

## 📝 Prompts Used (Summary)
- "Create a T3 stack project for a restaurant menu system."
- "Implement custom email/OTP authentication without NextAuth."
- "Create a dashboard for managing restaurants and menus."
- "Design a public menu page with sticky category headers."
- "Implement image upload for dishes using Base64."
- "Add Veg/Non-Veg classification to dishes."

## 🤖 AI Helpfulness & Corrections
**Helpfulness:**
- Rapidly scaffolded the project structure and boilerplate code.
- Generated complex UI components (like the sticky scroll spy navigation) quickly.
- Helped debug type errors in tRPC routers.

**Mistakes & Corrections:**
- **Issue:** Initially suggested using `NextAuth` despite the requirement to avoid it.
    - **Correction:** Manually implemented a custom JWT-based auth system using `jsonwebtoken` and `cookies`.
- **Issue:** The "Read More" button in the menu card wasn't functional initially.
    - **Correction:** Extracted the dish card into a separate component with local state to handle the toggle.
- **Issue:** Image upload was initially URL-only.
    - **Correction:** Implemented a file input that converts images to Base64 strings for storage.

## 🛡️ Edge Cases Handled
- **Authentication:**
    - Users cannot sign up with an existing email (Conflict error).
    - Users cannot login with a non-existent email (Not Found error).
    - OTP verification handles expiration and invalid codes.
- **Data Integrity:**
    - preventing orphan records (though cascade delete is configured).
- **UI/UX:**
    - "No dishes available" state for empty categories.
    - "No categories" state for new restaurants.
    - Loading states during form submissions.
    - Responsive design for various screen sizes.
- **Input Validation:**
    - Zod schemas ensure all form inputs are valid (e.g., positive prices, valid emails).
    - File size limits for image uploads (handled via API config).

## ⚠️ Edge Cases Not Handled (Due to Time/Scope)
- **Image Storage:** Currently, images are stored as Base64 strings in the database. For a production app at scale, this should be offloaded to an object storage service like AWS S3 or Cloudinary to improve database performance and reduce costs.
- **Rate Limiting:** There is no rate limiting on the OTP generation endpoint, which could be abused.
- **Concurrent Edits:** No optimistic locking to prevent overwriting changes if multiple admins edit the same dish simultaneously.
- **Email Delivery:** If the email service fails, the user is stuck. A fallback mechanism or retry logic would be beneficial.

## 📦 How to Run Locally

1.  Clone the repository.
2.  Install dependencies: `npm install`
3.  Set up environment variables in `.env`:
    ```env
    DATABASE_URL="postgresql://..."
    JWT_SECRET="supersecret"
    EMAIL_SERVER="smtps://..."
    EMAIL_FROM="..."
    ```
4.  Push the database schema: `npx prisma db push`
5.  Run the development server: `npm run dev`
