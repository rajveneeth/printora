import type {
  AddressModel,
  CartItemModel,
  CartModel,
  CategoryModel,
  OrderModel,
  ProductModel,
  ReviewModel,
  SellerProfileModel,
  UserModel,
} from '@/models';

export interface UserRepository {
  findById(userId: string): Promise<UserModel | null>;
  findByEmail(email: string): Promise<UserModel | null>;
  createBuyer(input: Pick<UserModel, 'email' | 'name'>): Promise<UserModel>;
}

export interface AddressRepository {
  listByUser(userId: string): Promise<AddressModel[]>;
  setDefault(userId: string, addressId: string): Promise<AddressModel>;
}

export interface SellerRepository {
  findApprovedBySlug(slug: string): Promise<SellerProfileModel | null>;
  listApproved(): Promise<SellerProfileModel[]>;
}

export interface CategoryRepository {
  listActive(): Promise<CategoryModel[]>;
  findBySlug(slug: string): Promise<CategoryModel | null>;
}

export interface ProductRepository {
  findPublishedBySlug(slug: string): Promise<ProductModel | null>;
  listPublished(input: ProductSearchInput): Promise<ProductModel[]>;
  listBySeller(sellerId: string): Promise<ProductModel[]>;
}

export interface CartRepository {
  findActiveCart(input: CartOwnerInput): Promise<CartModel | null>;
  addItem(cartId: string, input: AddCartItemInput): Promise<CartItemModel>;
  removeItem(cartItemId: string): Promise<void>;
}

export interface OrderRepository {
  findByOrderNumber(orderNumber: string): Promise<OrderModel | null>;
  listByBuyer(buyerId: string): Promise<OrderModel[]>;
  createFromCart(input: CreateOrderInput): Promise<OrderModel>;
}

export interface ReviewRepository {
  listPublishedForProduct(productId: string): Promise<ReviewModel[]>;
  createProductReview(input: CreateReviewInput): Promise<ReviewModel>;
}

export interface ProductSearchInput {
  query?: string;
  categorySlug?: string;
  material?: string;
  customisable?: boolean;
  limit: number;
  offset: number;
}

export interface CartOwnerInput {
  userId?: string;
  sessionId?: string;
}

export interface AddCartItemInput {
  productId: string;
  variantId?: string;
  quantity: number;
  customisation?: string;
}

export interface CreateOrderInput {
  buyerId: string;
  cartId: string;
  addressId: string;
}

export interface CreateReviewInput {
  productId: string;
  authorId: string;
  orderItemId: string;
  rating: number;
  qualityRating: number;
  finishRating: number;
  accuracyRating: number;
  valueRating: number;
  title: string;
  body: string;
}
