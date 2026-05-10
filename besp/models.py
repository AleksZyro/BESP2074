from dataclasses import dataclass, field


@dataclass
class Region:
    name: str
    country_code: str

    population: int
    area_km2: float

    urbanization: float
    infrastructure: float
    housing_capacity: int
    economic_attractiveness: float
    metro_pull: float = 0.0

    gdp_billion_eur: float = 0.0
    unemployment_rate: float = 0.0

    birth_rate_modifier: float = 1.0
    death_rate_modifier: float = 1.0
    net_migration_modifier: float = 1.0

    data_confidence: float = 1.0
    population_note: str = ""

    @property
    def population_density(self) -> float:
        if self.area_km2 <= 0:
            return 0.0

        return self.population / self.area_km2

    @property
    def housing_overload(self) -> float:
        if self.housing_capacity <= 0:
            return 1.0

        return self.population / self.housing_capacity


@dataclass
class Country:
    name: str
    code: str

    base_birth_rate: float
    base_death_rate: float
    base_net_migration_rate: float

    stability: float
    eu_integration: float
    corruption: float

    regions: list[Region] = field(default_factory=list)


@dataclass
class RegionYearResult:
    start_year: int
    end_year: int

    region_name: str
    country_code: str

    start_population: int
    births: int
    deaths: int
    natural_change: int
    net_external_migration: int
    internal_migration: int
    end_population: int

    start_gdp_billion_eur: float
    end_gdp_billion_eur: float
    gdp_growth_rate: float
    gdp_per_capita_eur: float
    unemployment_rate: float

    area_km2: float
    population_density: float
    housing_overload: float
    regional_attractiveness: float
    data_confidence: float
    population_note: str


@dataclass
class CountryYearResult:
    start_year: int
    end_year: int
    country_name: str
    country_code: str

    start_population: int
    end_population: int
    births: int
    deaths: int
    natural_change: int
    net_external_migration: int
    internal_migration: int

    start_gdp_billion_eur: float
    end_gdp_billion_eur: float
    gdp_growth_rate: float
    gdp_per_capita_eur: float
    average_unemployment_rate: float

    average_population_density: float
    average_housing_overload: float
    average_regional_attractiveness: float
