# 🍳 Virtual Kitchen - AI-Powered Recipe Generator

A full-stack web application that uses AI to generate personalized recipes based on your available ingredients. Upload photos of your kitchen, track your inventory, and get instant recipe suggestions with smart ingredient management.


## 🌟 Key Features

### 📸 Smart Ingredient Recognition

- **AI-powered image analysis** using OpenAI's GPT-4 Vision API
- Upload photos of your kitchen, pantry, or grocery receipts
- Automatic ingredient extraction with quantities and categories
- Duplicate detection and smart merging

### 🥘 Intelligent Recipe Generation

- **AI-generated recipes** based on available ingredients
- Customizable filters: dietary preferences, meal type, calories, cuisine, servings
- Match percentage showing ingredient availability
- Halal-by-default with support for Vegan, Vegetarian, Gluten-Free, Keto, and more

### 📦 Kitchen Inventory Management

- Real-time ingredient tracking with quantities
- Category-based organization (Protein, Carbs, Vegetables, etc.)
- Quick quantity adjustment (+/- buttons)
- Mark essential items with low-stock alerts
- Batch operations (select multiple, delete, edit)

### 🛒 Automatic Shopping List

- Zero-quantity essentials auto-added to shopping list
- Mark items as purchased
- Clear purchased items in bulk
- Manual item addition with categories

### ❤️ Recipe Management

- Save favorite recipes
- Cooking history tracking with timestamps
- "Cook This Now" feature with smart ingredient deduction
- Share recipes via native share API
- Detailed recipe modal with instructions

### 🎨 Modern UI/UX

- Warm, inviting color palette (#f0eae3, #372f29)
- Responsive design (mobile, tablet, desktop)
- Toast notifications for user feedback
- Confirmation modals for critical actions
- Loading states and error handling

## 🛠️ Tech Stack

### Frontend

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Shadcn/UI** - Reusable component library
- **React Hot Toast** - Beautiful notifications
- **React Dropzone** - Drag & drop file uploads
- **Lucide React** - Icon library

### Backend

- **Next.js API Routes** - Serverless functions
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **Clerk** - Authentication and user management

### AI & Image Processing

- **OpenAI GPT-4o** - Recipe generation
- **OpenAI GPT-4 Vision** - Image analysis
- **Browser Image Compression** - Client-side optimization

### Testing

- **Jest** - Testing framework
- **React Testing Library** - Component testing
- **14 passing tests** covering utilities, components, and pages

## 📁 Project Structure

```
virtual-kitchen/
├── app/                      # Next.js App Router
│   ├── api/                  # API routes
│   │   ├── analyze-image/    # Image analysis endpoint
│   │   ├── analyze-receipt/  # Receipt scanning endpoint
│   │   ├── generate-recipes/ # Recipe generation endpoint
│   │   ├── ingredients/      # CRUD operations
│   │   ├── recipes/          # Recipe management
│   │   └── shopping-list/    # Shopping list operations
│   ├── favorites/            # Saved recipes page
│   ├── history/              # Cooking history page
│   ├── kitchen/              # Inventory management page
│   ├── recipes/              # Recipe generation page
│   ├── shopping-list/        # Shopping list page
│   └── upload/               # Image upload page
├── components/               # Reusable components
│   ├── ui/                   # Shadcn UI components
│   ├── ConfirmModal.tsx      # Confirmation dialogs
│   └── Navbar.tsx            # Navigation bar
├── lib/                      # Utility functions
│   ├── analyzeImage.ts       # Image analysis logic
│   ├── analyzeReceipt.ts     # Receipt parsing logic
│   ├── generateRecipe.ts     # Recipe generation logic
│   ├── mongodb.ts            # Database connection
│   ├── openai.ts             # OpenAI client
│   └── recipeUtils.ts        # Recipe utilities
├── models/                   # MongoDB schemas
│   ├── Ingredient.ts         # Ingredient model
│   ├── Recipe.ts             # Recipe model
│   └── ShoppingList.ts       # Shopping list model
└── __tests__/                # Test suites
    ├── api/                  # API tests
    ├── app/                  # Page tests
    ├── components/           # Component tests
    └── lib/                  # Utility tests
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB database (local or Atlas)
- OpenAI API key
- Clerk account for authentication

### Installation

1. **Clone the repository**

```bash
   git clone https://github.com/Mohamed-Salah-222/Vritual-Kitchen
   cd virtual-kitchen
```

2. **Install dependencies**

```bash
   npm install
```

3. **Set up environment variables**
   Create a `.env.local` file:

```env
   # MongoDB
   MONGODB_URI=your_mongodb_connection_string

   # OpenAI
   OPENAI_API_KEY=your_openai_api_key

   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
```

4. **Run the development server**

```bash
   npm run dev
```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🧪 Testing

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode for development
npm run test:coverage # Generate coverage report
```

**Test Results:**

- ✅ 14 passing tests
- ✅ 3 test suites (utilities, components, pages)
- ✅ Coverage of critical user flows

## 🎯 Key Technical Implementations

### 1. AI Image Analysis

Uses OpenAI's GPT-4 Vision to analyze kitchen photos and extract:

- Ingredient names
- Quantities with units
- Categories
- Automatic duplicate detection

### 2. Smart Recipe Generation

AI generates recipes with:

- Ingredient availability checking
- Match percentage calculation
- Dietary restriction filtering
- Accurate calorie calculations
- Step-by-step instructions

### 3. Optimistic UI Updates

Instant feedback for user actions:

- Real-time quantity adjustments
- Immediate UI updates with background sync
- Error rollback on failure

### 4. Auto Shopping List

Essential items with zero quantity automatically added to shopping list using database triggers.

### 5. Smart Quantity Deduction

"Cook This Now" feature intelligently reduces ingredients:

- Grams reduced by recipe amount
- Unit conversion (kg ↔ grams, liters ↔ ml)
- Pieces reduced by count

## 📊 Database Schema

### Ingredient

```typescript
{
  userId: string
  name: string
  quantity: string
  unit: 'grams' | 'kg' | 'pieces' | ...
  category: 'protein' | 'carbs' | ...
  isEssential: boolean
  addedAt: Date
  lastUpdated: Date
}
```

### Recipe

```typescript
{
  userId: string
  name: string
  description: string
  prepTime: string
  cookTime: string
  servings: number
  calories: number
  ingredients: Array<{
    name: string
    amount: string
    fromKitchen: boolean
  }>
  instructions: string[]
  tags: string[]
  isFavorite: boolean
  cookedAt: Date | null
}
```

### Shopping List

```typescript
{
  userId: string;
  name: string;
  quantity: string;
  unit: string;
  category: string;
  isPurchased: boolean;
  addedAt: Date;
}
```

## 🔐 Security & Best Practices

- ✅ Environment variables for sensitive data
- ✅ Clerk authentication for secure user management
- ✅ API route protection with userId validation
- ✅ MongoDB connection pooling
- ✅ Input validation and sanitization
- ✅ Error handling and logging
- ✅ TypeScript for type safety

## 🎨 Design Decisions

### Color Palette

- Primary: `#372f29` (Warm dark brown)
- Secondary: `#ebe6de` (Soft beige)
- Accent: `#ded8c5` (Light taupe)
- Background: Gradient from `#f0eae3` to `#eae4dd`

### UX Features

- Warm, inviting aesthetic for food-related app
- Clear visual hierarchy
- Consistent button styles with hover effects
- Loading states for async operations
- Empty states with helpful guidance
- Mobile-first responsive design

## 🚧 Future Enhancements

- [ ] Meal planning calendar
- [ ] Nutrition tracking
- [ ] Recipe ratings and reviews
- [ ] Social features (share with friends)
- [ ] Barcode scanning for quick ingredient entry
- [ ] Voice input for hands-free operation
- [ ] Integration with grocery delivery APIs
- [ ] Leftover ingredient suggestions
- [ ] Cooking timers and reminders


## 👤 Author

**Your Name**

- Portfolio: https://www.mohamedsalah.dev/
- LinkedIn: https://www.linkedin.com/in/mohamed-salah-7933a6212/
- GitHub: https://github.com/Mohamed-Salah-222

## 🙏 Acknowledgments

- OpenAI for GPT-4 Vision and GPT-4o APIs
- Clerk for authentication
- Shadcn for UI components
- Vercel for hosting platform

---

**Built with ❤️ using Next.js, TypeScript, and AI**
