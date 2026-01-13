/**
 * This file was automatically generated using the
 * frontstack CLI, please do not edit it manually!
 */

import type { components } from './fetch-api.d.ts'

type RequestOptions = {
    /**
     * @description URL to the current page
     *
     * Optionally, frontstack accepts a URL to the current page. This is useful for tracking purposes.
     */
    requestUrl?: string

    /**
     * @description Context key
     *
     * Providing a context key will override the default context key for the request
     */
    contextKey?: string
}

/* List of all types used to fetch block parameters */

export type AllCategoriesParameters = {
}

export type CategoryProductsParameters = {
    /**
     * @description Description missing for categoryId
     */
    categoryId: string;
}

export type FeaturedCategoriesParameters = {
}

export type FeaturedProductsParameters = {
}

export type FurnitureProductsParameters = {
    /**
     * @description Description missing for categoryId
     */
    categoryId: string;
}


/* List of all blocks, used for IDE autocompletion */

type ListingParameters = {
    AllCategories: AllCategoriesParameters
    CategoryProducts: CategoryProductsParameters
    FeaturedCategories: FeaturedCategoriesParameters
    FeaturedProducts: FeaturedProductsParameters
    FurnitureProducts: FurnitureProductsParameters
}

type Endpoints = {
    [key in keyof Listings | keyof Blocks]: string;
}

/* Types for split block/listing methods */
export type Blocks = {
    CategoryCard: never
    CategoryDetail: never
    CmsPage: never
    FurnitureProductCard: never
    ProductCard: never
    ProductDetail: never
}

export type Listings = {
    AllCategories: AllCategoriesParameters
    CategoryProducts: CategoryProductsParameters
    FeaturedCategories: FeaturedCategoriesParameters
    FeaturedProducts: FeaturedProductsParameters
    FurnitureProducts: FurnitureProductsParameters
}

declare global {
export type AllCategories = components['schemas']['AllCategories']
export type CategoryCard = components['schemas']['CategoryCard']
export type CategoryDetail = components['schemas']['CategoryDetail']
export type CategoryProducts = components['schemas']['CategoryProducts']
export type CmsPage = components['schemas']['CmsPage']
export type FeaturedCategories = components['schemas']['FeaturedCategories']
export type FeaturedProducts = components['schemas']['FeaturedProducts']
export type FurnitureProductCard = components['schemas']['FurnitureProductCard']
export type FurnitureProducts = components['schemas']['FurnitureProducts']
export type ProductCard = components['schemas']['ProductCard']
export type ProductDetail = components['schemas']['ProductDetail']
}

export type Responses = {
    AllCategories: AllCategories
    CategoryCard: CategoryCard
    CategoryDetail: CategoryDetail
    CategoryProducts: CategoryProducts
    CmsPage: CmsPage
    FeaturedCategories: FeaturedCategories
    FeaturedProducts: FeaturedProducts
    FurnitureProductCard: FurnitureProductCard
    FurnitureProducts: FurnitureProducts
    ProductCard: ProductCard
    ProductDetail: ProductDetail
}

export type ListingQueryFilters = {
    AllCategories: components['schemas']['AllCategoriesQueryOptions']['filter']
    CategoryProducts: components['schemas']['CategoryProductsQueryOptions']['filter']
    FeaturedCategories: components['schemas']['FeaturedCategoriesQueryOptions']['filter']
    FeaturedProducts: components['schemas']['FeaturedProductsQueryOptions']['filter']
    FurnitureProducts: components['schemas']['FurnitureProductsQueryOptions']['filter']
}

export type ListingQuerySorts = {
    AllCategories: components['schemas']['AllCategoriesQueryOptions']['sort']
    CategoryProducts: components['schemas']['CategoryProductsQueryOptions']['sort']
    FeaturedCategories: components['schemas']['FeaturedCategoriesQueryOptions']['sort']
    FeaturedProducts: components['schemas']['FeaturedProductsQueryOptions']['sort']
    FurnitureProducts: components['schemas']['FurnitureProductsQueryOptions']['sort']
}

type FetchMode = {
    AllCategories: 'query';
    CategoryCard: 'key';
    CategoryDetail: 'key';
    CategoryProducts: 'query';
    CmsPage: 'key';
    FeaturedCategories: 'query';
    FeaturedProducts: 'query';
    FurnitureProductCard: 'key';
    FurnitureProducts: 'query';
    ProductCard: 'key';
    ProductDetail: 'key';
}

declare global {
    export type Page = components['schemas']['Page']
    export type PageRoute = components["schemas"]["PageRoute"];
    export type RouteMeta = components["schemas"]["RouteMeta"];
    export type AlternateRoute = components["schemas"]["AlternateRoute"];
}

declare global {
    export type Pagination = components["schemas"]["_page"];
    export type FilterData = components["schemas"]["_filter"];
    export type FilterGroup = components["schemas"]["_filter"][string];
    export type Filter = components["schemas"]["_filter"][string][number];
    export type SortingGroup = components["schemas"]["_sort"];
    export type Sorting = components["schemas"]["_sort"][number];
    export type AggregationData = components["schemas"]["_aggregation"];
    export type AggregationGroup = components["schemas"]["_aggregation"][string];
    export type Aggregation = components["schemas"]["_aggregation"][string]["total"];
}

declare global {
    export type Media = components['schemas']['Media']
    export type Price = components['schemas']['Price']
    export type Seo = components['schemas']['Seo']
    export type Vendor = components['schemas']['Vendor']
    export type Weight = components['schemas']['Weight']
    export type Option = components['schemas']['Option']
    export type Swatch = components['schemas']['Swatch']
    export type PriceScale = components['schemas']['PriceScale']
    export type Sorting = components['schemas']['Sorting']
    export type Availability = components['schemas']['Availability']
    export type StockLevel = components['schemas']['StockLevel']
}

declare global {
    export type ContextToken = string

    export type Context = {
        /**
        * The region of the context - e.g. 'uk'
        */
        region: string
        /**
        * The locale of the context - e.g. 'en-gb'
        */
        locale: string
        /**
        * The scope of the context - e.g. 'b2c'
        */
        scope: string
        /**
        * The identifier of the context
        */
        token: ContextToken
    }

    export type ContextOption = {
        /**
        * The region of the context - e.g. 'uk'
        */
        region: string
        /**
        * The currency of the context - e.g. 'GBP'
        */
        currency: string
        /**
        * List of locales of the context
        */
        locales: Array<Locale>
    }

    export type Locale = {
        /**
        * The key of the locale - e.g. 'en-GB'
        */
        key: string
        /**
        * The URL configured for the locale - e.g. 'https://demo-shop.com/uk/en'
        */
        url: string
    }
} 