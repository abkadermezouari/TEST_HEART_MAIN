// Types générés depuis SCHEMA.sql — à régénérer avec :
//   npx supabase gen types typescript --project-id <id> > src/lib/database.types.ts

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          role: "user" | "nutritionist" | "partner_admin" | "admin";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: "user" | "nutritionist" | "partner_admin" | "admin";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          full_name?: string | null;
          avatar_url?: string | null;
          role?: "user" | "nutritionist" | "partner_admin" | "admin";
          updated_at?: string;
        };
      };

      user_health_profiles: {
        Row: {
          id: string;
          user_id: string;
          age: number | null;
          weight_kg: number | null;
          height_cm: number | null;
          activity_level: "sedentary" | "moderate" | "active" | null;
          health_conditions: string[];
          goals: string[];
          bmr_kcal: number | null;
          tdee_kcal: number | null;
          is_complete: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          age?: number | null;
          weight_kg?: number | null;
          height_cm?: number | null;
          activity_level?: "sedentary" | "moderate" | "active" | null;
          health_conditions?: string[];
          goals?: string[];
          bmr_kcal?: number | null;
          tdee_kcal?: number | null;
          is_complete?: boolean;
        };
        Update: {
          age?: number | null;
          weight_kg?: number | null;
          height_cm?: number | null;
          activity_level?: "sedentary" | "moderate" | "active" | null;
          health_conditions?: string[];
          goals?: string[];
          bmr_kcal?: number | null;
          tdee_kcal?: number | null;
          is_complete?: boolean;
          updated_at?: string;
        };
      };

      partners: {
        Row: {
          id: string;
          owner_id: string | null;
          name: string;
          description: string | null;
          logo_url: string | null;
          cover_url: string | null;
          address_line: string | null;
          city: string | null;
          postal_code: string | null;
          country: string;
          latitude: number | null;
          longitude: number | null;
          phone: string | null;
          email: string | null;
          website: string | null;
          opening_hours: Json | null;
          partner_code: string | null;
          is_active: boolean;
          is_verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id?: string | null;
          name: string;
          description?: string | null;
          logo_url?: string | null;
          cover_url?: string | null;
          address_line?: string | null;
          city?: string | null;
          postal_code?: string | null;
          country?: string;
          latitude?: number | null;
          longitude?: number | null;
          phone?: string | null;
          email?: string | null;
          website?: string | null;
          opening_hours?: Json | null;
          partner_code?: string | null;
          is_active?: boolean;
          is_verified?: boolean;
        };
        Update: Partial<Omit<Database["public"]["Tables"]["partners"]["Insert"], "id">>;
      };

      product_categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          icon: string | null;
          parent_id: string | null;
          sort_order: number;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          icon?: string | null;
          parent_id?: string | null;
          sort_order?: number;
        };
        Update: Partial<Database["public"]["Tables"]["product_categories"]["Insert"]>;
      };

      products: {
        Row: {
          id: string;
          category_id: string | null;
          name: string;
          brand: string | null;
          description: string | null;
          barcode: string | null;
          image_url: string | null;
          image_urls: string[];
          nutri_score: "A" | "B" | "C" | "D" | "E" | null;
          glycemic_index: number | null;
          labels: string[];
          compatible_with: string[];
          energy_kcal: number | null;
          carbs_g: number | null;
          sugars_g: number | null;
          fat_g: number | null;
          saturated_fat_g: number | null;
          fiber_g: number | null;
          protein_g: number | null;
          sodium_g: number | null;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category_id?: string | null;
          name: string;
          brand?: string | null;
          description?: string | null;
          barcode?: string | null;
          image_url?: string | null;
          image_urls?: string[];
          nutri_score?: "A" | "B" | "C" | "D" | "E" | null;
          glycemic_index?: number | null;
          labels?: string[];
          compatible_with?: string[];
          energy_kcal?: number | null;
          carbs_g?: number | null;
          sugars_g?: number | null;
          fat_g?: number | null;
          saturated_fat_g?: number | null;
          fiber_g?: number | null;
          protein_g?: number | null;
          sodium_g?: number | null;
          is_published?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
      };

      partner_inventory: {
        Row: {
          id: string;
          partner_id: string;
          product_id: string;
          price: number;
          currency: string;
          quantity: number;
          is_available: boolean;
          low_stock_threshold: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          partner_id: string;
          product_id: string;
          price: number;
          currency?: string;
          quantity?: number;
          is_available?: boolean;
          low_stock_threshold?: number;
        };
        Update: Partial<Database["public"]["Tables"]["partner_inventory"]["Insert"]>;
      };

      recipes: {
        Row: {
          id: string;
          created_by: string | null;
          title: string;
          description: string | null;
          image_url: string | null;
          prep_time_min: number | null;
          cook_time_min: number | null;
          servings: number | null;
          difficulty: "easy" | "medium" | "hard" | null;
          calories_kcal: number | null;
          price_estimate: number | null;
          diet_tags: string[];
          compatible_with: string[];
          is_published: boolean;
          is_featured: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          created_by?: string | null;
          title: string;
          description?: string | null;
          image_url?: string | null;
          prep_time_min?: number | null;
          cook_time_min?: number | null;
          servings?: number | null;
          difficulty?: "easy" | "medium" | "hard" | null;
          calories_kcal?: number | null;
          price_estimate?: number | null;
          diet_tags?: string[];
          compatible_with?: string[];
          is_published?: boolean;
          is_featured?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["recipes"]["Insert"]>;
      };

      recipe_ingredients: {
        Row: {
          id: string;
          recipe_id: string;
          product_id: string | null;
          name: string;
          quantity: string;
          sort_order: number;
        };
        Insert: {
          id?: string;
          recipe_id: string;
          product_id?: string | null;
          name: string;
          quantity: string;
          sort_order?: number;
        };
        Update: Partial<Database["public"]["Tables"]["recipe_ingredients"]["Insert"]>;
      };

      recipe_steps: {
        Row: {
          id: string;
          recipe_id: string;
          step_number: number;
          instruction: string;
        };
        Insert: {
          id?: string;
          recipe_id: string;
          step_number: number;
          instruction: string;
        };
        Update: Partial<Database["public"]["Tables"]["recipe_steps"]["Insert"]>;
      };

      articles: {
        Row: {
          id: string;
          author_id: string | null;
          title: string;
          slug: string;
          excerpt: string | null;
          content: string | null;
          image_url: string | null;
          category: string;
          read_time_min: number | null;
          difficulty: "beginner" | "intermediate" | "advanced" | null;
          tags: string[];
          is_published: boolean;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          author_id?: string | null;
          title: string;
          slug: string;
          excerpt?: string | null;
          content?: string | null;
          image_url?: string | null;
          category?: string;
          read_time_min?: number | null;
          difficulty?: "beginner" | "intermediate" | "advanced" | null;
          tags?: string[];
          is_published?: boolean;
          published_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["articles"]["Insert"]>;
      };

      user_saved_products: {
        Row: { user_id: string; product_id: string; saved_at: string };
        Insert: { user_id: string; product_id: string; saved_at?: string };
        Update: never;
      };

      user_saved_recipes: {
        Row: { user_id: string; recipe_id: string; saved_at: string };
        Insert: { user_id: string; recipe_id: string; saved_at?: string };
        Update: never;
      };

      user_read_articles: {
        Row: { user_id: string; article_id: string; read_at: string };
        Insert: { user_id: string; article_id: string; read_at?: string };
        Update: never;
      };

      shopping_lists: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: { id?: string; user_id: string; name?: string; is_active?: boolean };
        Update: Partial<Database["public"]["Tables"]["shopping_lists"]["Insert"]>;
      };

      shopping_list_items: {
        Row: {
          id: string;
          shopping_list_id: string;
          product_id: string | null;
          product_name: string;
          quantity: number;
          is_checked: boolean;
          added_at: string;
        };
        Insert: {
          id?: string;
          shopping_list_id: string;
          product_id?: string | null;
          product_name: string;
          quantity?: number;
          is_checked?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["shopping_list_items"]["Insert"]>;
      };

      patient_alerts: {
        Row: {
          id: string;
          nutritionist_id: string;
          patient_id: string;
          type: "warning" | "success" | "info";
          title: string;
          message: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          nutritionist_id: string;
          patient_id: string;
          type: "warning" | "success" | "info";
          title: string;
          message: string;
          is_read?: boolean;
        };
        Update: { is_read?: boolean };
      };

      partner_product_views: {
        Row: {
          id: string;
          partner_id: string;
          product_id: string;
          user_id: string | null;
          viewed_at: string;
        };
        Insert: {
          id?: string;
          partner_id: string;
          product_id: string;
          user_id?: string | null;
          viewed_at?: string;
        };
        Update: never;
      };

      partner_catalog: {
        Row: {
          id: string;
          partner_id: string;
          type: "product" | "recipe";
          name: string;
          data: Record<string, unknown>;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          partner_id: string;
          type: "product" | "recipe";
          name: string;
          data?: Record<string, unknown>;
          is_published?: boolean;
        };
        Update: {
          type?: "product" | "recipe";
          name?: string;
          data?: Record<string, unknown>;
          is_published?: boolean;
        };
      };

      product_search_logs: {
        Row: {
          id: string;
          partner_id: string | null;
          product_id: string | null;
          search_term: string | null;
          user_id: string | null;
          searched_at: string;
        };
        Insert: {
          id?: string;
          partner_id?: string | null;
          product_id?: string | null;
          search_term?: string | null;
          user_id?: string | null;
          searched_at?: string;
        };
        Update: never;
      };
    };

    Views: {
      partner_daily_views: {
        Row: {
          partner_id: string;
          day: string;
          total_views: number;
        };
      };
    };

    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};

// ── Helpers de type raccourcis ────────────────────────────────
type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type Profile = Tables<"profiles">;
export type UserHealthProfile = Tables<"user_health_profiles">;
export type Partner = Tables<"partners">;
export type ProductCategory = Tables<"product_categories">;
export type Product = Tables<"products">;
export type PartnerInventory = Tables<"partner_inventory">;
export type Recipe = Tables<"recipes">;
export type RecipeIngredient = Tables<"recipe_ingredients">;
export type RecipeStep = Tables<"recipe_steps">;
export type Article = Tables<"articles">;
export type ShoppingList = Tables<"shopping_lists">;
export type ShoppingListItem = Tables<"shopping_list_items">;
export type PatientAlert = Tables<"patient_alerts">;
export type PartnerCatalog = Tables<"partner_catalog">;
