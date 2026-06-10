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
    integration_index: float = 0.5
    satisfaction_index: float = 0.5
    inflation_sensitivity: float = 1.0
    election_sensitivity: float = 1.0
    political_identity_bias: float = 0.0
    election_alignment_index: float = 0.0
    annexation_pressure_years_remaining: int = 0
    annexation_pressure_years_total: int = 0
    annexation_satisfaction_penalty: float = 0.0
    annexation_integration_penalty: float = 0.0
    annexation_source_unemployment_rate: float = 0.0
    annexation_source_inflation_rate: float = 0.0
    annexation_source_integration_index: float = 0.0
    annexation_source_satisfaction_index: float = 0.0

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
    base_budget_balance_pct_gdp: float = -0.03
    base_debt_to_gdp: float = 0.60
    base_investment_climate_index: float = 0.50
    enabled: bool = True
    baseline_year: int = 2020
    baseline_population: int = 0
    baseline_gdp_scale_vs_2020: float = 1.0
    baseline_unemployment_rate: float = 0.12
    baseline_inflation_rate: float = 0.02
    base_integration_index: float = 0.50
    base_satisfaction_index: float = 0.50
    base_election_alignment_index: float = 0.0
    election_cycle_years: int = 4
    last_election_year: int = 2020
    election_sensitivity: float = 0.55

    regions: list[Region] = field(default_factory=list)


@dataclass
class SimulationScenario:
    code: str
    name: str
    description: str

    birth_rate_multiplier: float = 1.0
    death_rate_multiplier: float = 1.0
    net_migration_rate_shift: float = 0.0
    gdp_growth_bias: float = 0.0
    unemployment_bias: float = 0.0
    attractiveness_bias: float = 0.0
    integration_bias: float = 0.0
    inflation_bias: float = 0.0
    satisfaction_bias: float = 0.0
    election_tension_bias: float = 0.0


@dataclass
class ShockDefinition:
    code: str
    name: str
    description: str
    category: str
    annual_probability: float

    gdp_growth_bias: float = 0.0
    unemployment_bias: float = 0.0
    net_migration_rate_shift: float = 0.0
    birth_rate_multiplier: float = 1.0
    death_rate_multiplier: float = 1.0
    attractiveness_bias: float = 0.0

    cooldown_years: int = 0
    severity_min: float = 1.0
    severity_max: float = 1.0

    country_weight_overrides: dict[str, float] = field(default_factory=dict)


@dataclass
class ShockEvent:
    start_year: int
    end_year: int
    country_code: str
    country_name: str
    shock_code: str
    shock_name: str
    category: str
    probability_applied: float
    severity_scale: float
    gdp_growth_bias: float
    unemployment_bias: float
    net_migration_rate_shift: float
    message: str = ""
    affected_region_names: list[str] = field(default_factory=list)
    affected_region_keys: list[str] = field(default_factory=list)


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
    integration_index: float
    inflation_rate: float
    satisfaction_index: float
    election_tension_index: float
    election_alignment_index: float
    election_alignment_shift: float
    election_last_year: int
    election_next_year: int
    election_cycle_progress: float
    election_happened_this_year: bool
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
    average_integration_index: float
    average_inflation_rate: float
    average_satisfaction_index: float
    election_tension_index: float
    election_alignment_index: float
    election_alignment_shift: float
    election_last_year: int
    election_next_year: int
    election_cycle_progress: float
    election_happened_this_year: bool

    budget_balance_pct_gdp: float
    debt_to_gdp: float
    stability_index: float
    corruption_index: float
    investment_climate_index: float
