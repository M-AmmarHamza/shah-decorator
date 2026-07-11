import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const configured = Boolean(
  url && key && !url.includes("your-project") && !key.includes("your_key"),
);
const client = configured
  ? createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

const tableMap = {
  inventory: "products",
  pages: "pages",
  events: "events",
  coming: "coming_soon",
  blogs: "blogs",
  orders: "orders",
  settings: "site_settings",
  categories: "categories",
  reviews: "product_reviews",
  analytics: "analytics_events",
};
const db = {
  configured,
  client,
  async session() {
    return client ? (await client.auth.getSession()).data.session : null;
  },
  async profile() {
    const session = await this.session();
    if (!session) return null;
    const { data, error } = await client
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();
    if (error) throw error;
    return data;
  },
  async list(resource, query = {}) {
    if (!client) return null;
    let request = client
      .from(tableMap[resource] || resource)
      .select(query.select || "*");
    if (query.eq)
      Object.entries(query.eq).forEach(
        ([field, value]) => (request = request.eq(field, value)),
      );
    if (query.order)
      request = request.order(query.order.column, {
        ascending: query.order.ascending ?? true,
      });
    const { data, error } = await request;
    if (error) throw error;
    return data;
  },
  async save(resource, row) {
    if (!client) return null;
    const { data, error } = await client
      .from(tableMap[resource] || resource)
      .upsert(row)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  async update(resource, id, changes) {
    if (!client) return null;
    const { data, error } = await client
      .from(tableMap[resource] || resource)
      .update(changes)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  async remove(resource, id) {
    if (!client) return null;
    const { error } = await client
      .from(tableMap[resource] || resource)
      .delete()
      .eq("id", id);
    if (error) throw error;
    return true;
  },
  async signIn(email, password) {
    if (!client) throw new Error("Supabase is not configured.");
    const { data, error } = await client.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },
  async signUp({
    email,
    password,
    fullName,
    phone,
    requestedRole = "customer",
  }) {
    if (!client) throw new Error("Supabase is not configured.");
    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, phone, requested_role: requestedRole },
      },
    });
    if (error) throw error;
    return data;
  },
  async signOut() {
    if (client) await client.auth.signOut();
  },
  async upload(bucket, file, path) {
    if (!client) throw new Error("Supabase is not configured.");
    const { data, error } = await client.storage
      .from(bucket)
      .upload(path, file, { upsert: false });
    if (error) throw error;
    return data;
  },
  async publicUrl(bucket, path) {
    return (
      client?.storage.from(bucket).getPublicUrl(path).data.publicUrl || null
    );
  },
  async track(eventName, metadata = {}, entityType = null, entityId = null) {
    if (!client) return;
    const session = await this.session();
    await client
      .from("analytics_events")
      .insert({
        event_name: eventName,
        metadata,
        entity_type: entityType,
        entity_id: entityId,
        user_id: session?.user?.id || null,
        session_id: sessionStorage.getItem("pakmarket_sid"),
      });
  },
};

if (!sessionStorage.getItem("pakmarket_sid"))
  sessionStorage.setItem("pakmarket_sid", crypto.randomUUID());
window.PakMarketDB = db;
if (configured && !location.pathname.toLowerCase().includes("admin")) {
  try {
    const [products, pages, events, coming, blogs, settings] = await Promise.all([db.list("products"), db.list("pages"), db.list("events"), db.list("coming"), db.list("blogs"), db.list("settings")]);
    if (products) localStorage.setItem("pakmarket_inventory_v1", JSON.stringify(products.map(product => ({id:product.id,name:product.name,slug:product.slug,sku:product.sku,category:product.category_name||"Uncategorized",image:product.image_url,description:product.description,price:Number(product.price),comparePrice:Number(product.compare_price||0),stock:Number(product.stock),enabled:product.status==="published",status:product.status==="published"?"active":"draft",featured:product.featured,newArrival:product.new_arrival,seoIndex:product.seo_index,seoTitle:product.seo_title,metaDescription:product.meta_description,keywords:(product.keywords||[]).join(", "),imageAlt:product.image_alt}))));
    if (pages?.length) localStorage.setItem("pakmarket_pages_v1", JSON.stringify(pages.map(page => ({key:page.page_key,heading:page.content?.heading,paragraph:page.content?.paragraph,...page.content,enabled:page.enabled,seoIndex:page.seo_index,metaTitle:page.meta_title,metaDescription:page.meta_description,keywords:(page.keywords||[]).join(", "),canonical:page.canonical_url}))));
    if (events) localStorage.setItem("pakmarket_events_v1", JSON.stringify(events.map(item => ({id:item.id,title:item.name,message:item.message,secondary:item.secondary_message,code:item.discount_code,start:item.starts_at,end:item.ends_at,enabled:item.enabled}))));
    if (coming) localStorage.setItem("pakmarket_coming_v1", JSON.stringify(coming.map(item => ({id:item.id,name:item.name,image:item.image_url,description:item.description,start:item.starts_at,end:item.launches_at,enabled:item.enabled}))));
    if (blogs) localStorage.setItem("pakmarket_blogs_v1", JSON.stringify(blogs.map(item => ({id:item.id,title:item.title,slug:item.slug,category:item.category,author:item.author_name,image:item.cover_url,excerpt:item.excerpt,content:item.content,enabled:item.status==="published",featured:item.featured,publishDate:item.published_at?.slice(0,10),seoIndex:item.seo_index,seoTitle:item.seo_title,metaDescription:item.meta_description,keywords:(item.keywords||[]).join(", ")}))));
    const global = settings?.find(item => item.key === "global")?.value;
    if (global) localStorage.setItem("pakmarket_global_settings_v1", JSON.stringify(global));
  } catch (error) { console.warn("PakMarket live-data sync unavailable", error); }
}
window.dispatchEvent(new CustomEvent("pakmarket:db-ready", { detail: db }));
