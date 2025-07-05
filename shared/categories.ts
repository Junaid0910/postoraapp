export const PREDEFINED_CATEGORIES = [
  // Life & Lifestyle
  { value: "travel", label: "Travel", icon: "✈️" },
  { value: "food", label: "Food", icon: "🍽️" },
  { value: "fitness", label: "Fitness", icon: "💪" },
  { value: "lifestyle", label: "Lifestyle", icon: "🌟" },
  { value: "fashion", label: "Fashion", icon: "👗" },
  { value: "beauty", label: "Beauty", icon: "💄" },
  { value: "home", label: "Home & Decor", icon: "🏠" },
  { value: "pets", label: "Pets", icon: "🐾" },
  { value: "family", label: "Family", icon: "👨‍👩‍👧‍👦" },
  { value: "relationships", label: "Relationships", icon: "💕" },
  
  // Work & Education
  { value: "work", label: "Work", icon: "💼" },
  { value: "business", label: "Business", icon: "📈" },
  { value: "education", label: "Education", icon: "📚" },
  { value: "study", label: "Study", icon: "✏️" },
  { value: "productivity", label: "Productivity", icon: "⚡" },
  { value: "coding", label: "Coding", icon: "💻" },
  { value: "design", label: "Design", icon: "🎨" },
  
  // Entertainment & Hobbies
  { value: "music", label: "Music", icon: "🎵" },
  { value: "movies", label: "Movies & TV", icon: "🎬" },
  { value: "books", label: "Books", icon: "📖" },
  { value: "gaming", label: "Gaming", icon: "🎮" },
  { value: "photography", label: "Photography", icon: "📸" },
  { value: "art", label: "Art", icon: "🖼️" },
  { value: "crafts", label: "Crafts & DIY", icon: "🔨" },
  { value: "gardening", label: "Gardening", icon: "🌱" },
  { value: "cooking", label: "Cooking", icon: "👨‍🍳" },
  
  // Sports & Activities
  { value: "sports", label: "Sports", icon: "⚽" },
  { value: "running", label: "Running", icon: "🏃" },
  { value: "cycling", label: "Cycling", icon: "🚴" },
  { value: "gym", label: "Gym", icon: "🏋️" },
  { value: "yoga", label: "Yoga", icon: "🧘" },
  { value: "swimming", label: "Swimming", icon: "🏊" },
  { value: "hiking", label: "Hiking", icon: "🥾" },
  { value: "adventure", label: "Adventure", icon: "🏔️" },
  
  // Health & Wellness
  { value: "health", label: "Health", icon: "🏥" },
  { value: "mental-health", label: "Mental Health", icon: "🧠" },
  { value: "meditation", label: "Meditation", icon: "🕯️" },
  { value: "wellness", label: "Wellness", icon: "🌸" },
  { value: "nutrition", label: "Nutrition", icon: "🥗" },
  { value: "skincare", label: "Skincare", icon: "✨" },
  
  // Social & Events
  { value: "social", label: "Social", icon: "👥" },
  { value: "events", label: "Events", icon: "🎉" },
  { value: "parties", label: "Parties", icon: "🥳" },
  { value: "celebrations", label: "Celebrations", icon: "🎊" },
  { value: "dates", label: "Dates", icon: "💑" },
  { value: "friends", label: "Friends", icon: "👫" },
  
  // Nature & Environment
  { value: "nature", label: "Nature", icon: "🌿" },
  { value: "wildlife", label: "Wildlife", icon: "🦋" },
  { value: "environment", label: "Environment", icon: "🌍" },
  { value: "sustainability", label: "Sustainability", icon: "♻️" },
  { value: "beach", label: "Beach", icon: "🏖️" },
  { value: "mountains", label: "Mountains", icon: "⛰️" },
  
  // Special Occasions
  { value: "birthday", label: "Birthday", icon: "🎂" },
  { value: "anniversary", label: "Anniversary", icon: "💒" },
  { value: "holiday", label: "Holiday", icon: "🎁" },
  { value: "vacation", label: "Vacation", icon: "🌴" },
  { value: "weekend", label: "Weekend", icon: "🏖️" },
  
  // Food Categories
  { value: "breakfast", label: "Breakfast", icon: "🥞" },
  { value: "lunch", label: "Lunch", icon: "🥙" },
  { value: "dinner", label: "Dinner", icon: "🍝" },
  { value: "dessert", label: "Dessert", icon: "🍰" },
  { value: "drinks", label: "Drinks", icon: "🥤" },
  { value: "coffee", label: "Coffee", icon: "☕" },
  { value: "restaurant", label: "Restaurant", icon: "🍽️" },
  { value: "street-food", label: "Street Food", icon: "🌮" },
  
  // Transport
  { value: "car", label: "Car", icon: "🚗" },
  { value: "bike", label: "Bike", icon: "🚲" },
  { value: "public-transport", label: "Public Transport", icon: "🚌" },
  { value: "flight", label: "Flight", icon: "✈️" },
  
  // Technology
  { value: "tech", label: "Technology", icon: "💻" },
  { value: "gadgets", label: "Gadgets", icon: "📱" },
  { value: "apps", label: "Apps", icon: "📲" },
  { value: "ai", label: "AI", icon: "🤖" },
  
  // Shopping
  { value: "shopping", label: "Shopping", icon: "🛍️" },
  { value: "online-shopping", label: "Online Shopping", icon: "💳" },
  { value: "deals", label: "Deals", icon: "💰" },
  
  // Miscellaneous
  { value: "weather", label: "Weather", icon: "🌤️" },
  { value: "news", label: "News", icon: "📰" },
  { value: "memories", label: "Memories", icon: "📝" },
  { value: "goals", label: "Goals", icon: "🎯" },
  { value: "achievements", label: "Achievements", icon: "🏆" },
  { value: "random", label: "Random", icon: "🎲" },
  { value: "other", label: "Other", icon: "📌" },
];

export function searchCategories(query: string) {
  if (!query) return PREDEFINED_CATEGORIES;
  
  const lowercaseQuery = query.toLowerCase();
  return PREDEFINED_CATEGORIES.filter(category =>
    category.label.toLowerCase().includes(lowercaseQuery) ||
    category.value.toLowerCase().includes(lowercaseQuery)
  );
}

export function getCategoryIcon(categoryValue: string): string {
  const category = PREDEFINED_CATEGORIES.find(cat => cat.value === categoryValue);
  return category?.icon || "📌";
}

export function getCategoryLabel(categoryValue: string): string {
  const category = PREDEFINED_CATEGORIES.find(cat => cat.value === categoryValue);
  return category?.label || categoryValue;
}