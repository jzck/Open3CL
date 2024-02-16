$before as $b | $after as $a | 
reduce ($b | keys_unsorted[]) as $k ({}; .[$k] =
    if ($a[$k] == 0 and $b[$k] == 0) then
        "OK"
    else if (pow(100 * ($a[$k] - $b[$k])/($a[$k] + $b[$k]); 2)) < 0.01 then
        "OK"
    else
        "KO"
    end
    end
)
