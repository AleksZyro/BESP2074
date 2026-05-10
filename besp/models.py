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

    birth_rate_modifier: float
    death_rate_modifier: float
    net_migration_modifier: float

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
    region_name: str
    country_code: str

    start_population: int
    births: int
    deaths: int
    net_external_migration: int
    internal_migration: int
    end_population: int

    population_density: float
    housing_overload: float
    data_confidence: float
    population_note: str
