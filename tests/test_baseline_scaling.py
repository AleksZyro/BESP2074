from types import SimpleNamespace

from besp.baseline import scale_integer_attribute_to_total


def test_small_target_can_leave_a_region_empty():
    regions = [SimpleNamespace(population=n) for n in (5, 4, 1)]
    scale_integer_attribute_to_total(regions, "population", 2)
    assert [region.population for region in regions] == [1, 1, 0]
