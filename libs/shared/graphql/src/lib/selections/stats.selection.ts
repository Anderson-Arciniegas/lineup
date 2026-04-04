const timeSeriesStatsFields = `
  total
`;

export const engagementStatsSelection = `
  {
    newFollowers {
      ${timeSeriesStatsFields}
    }
    visits {
      visits {
        ${timeSeriesStatsFields}
      }
      visitsByAuthType {
        anonymous
        identified
        data {
          period
          value
        }
      }
    }
  }
`;

export const catalogStatsSelection = `
  {
    catalogVisitsOverTime {
      ${timeSeriesStatsFields}
    }
    productsPerCatalog {
      count
      label
    }
    topByVisits {
      id
      title
      visits
    }
  }
`;

export const discountStatsSelection = `
  {
    byStatus {
      count
      label
    }
    byType {
      count
      label
    }
    expiringSoon {
      ${timeSeriesStatsFields}
    }
  }
`;

export const inventoryStatsSelection = `
  {
    productsWithoutStockCount
    recentStockMovements {
      creationDate
      id
      quantityDelta
      type
    }
    skusLowOrOutOfStockCount
  }
`;

export const productStatsSelection = `
  {
    topByLikes {
      id
      likes
      title
    }
    topByRating {
      id
      ratingAverage
      title
    }
    topByVisits {
      id
      title
      visits
    }
    visitToLikeRatio {
      ratio
      totalLikes
      totalVisits
    }
    withoutRatingsCount
    withoutVisitsCount
  }
`;
