export interface User { id:number; email:string; full_name:string; created_at:string }
export interface Brand { id:number; name:string; slug:string }
export interface Category { id:number; name:string; slug:string }
export interface Product { id:number; name:string; description:string; price:number; image_url:string; stock:number; brand:Brand; category:Category }
export interface Paginated<T> { items:T[]; total:number; page:number; page_size:number; total_pages:number }
export interface CartItem { id:number; quantity:number; product:Product }
export interface Cart { items:CartItem[]; subtotal:number; count:number }
export interface OrderItem { product_id:number; product_name:string; unit_price:number; quantity:number }
export interface Order { id:number; total:number; status:string; shipping_name:string; shipping_address:string; shipping_city:string; shipping_zip:string; shipping_email:string|null; shipping_phone:string|null; shipping_country:string|null; shipping_lat:number|null; shipping_lng:number|null; shipping_place_id:string|null; created_at:string; items:OrderItem[] }
export interface AuthResponse { access_token:string; token_type:string; user:User }
