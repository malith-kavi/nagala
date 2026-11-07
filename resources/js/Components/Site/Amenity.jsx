import {
    Baby,
    BedDouble,
    BedSingle,
    BugOff,
    Bike,
    Bird,
    Cake,
    Car,
    Check,
    CigaretteOff,
    Clock,
    Coffee,
    Cookie,
    Droplets,
    Drumstick,
    Fan,
    Flame,
    Footprints,
    GlassWater,
    House,
    Mountain,
    PawPrint,
    Refrigerator,
    Sailboat,
    ShowerHead,
    Snowflake,
    Sofa,
    Soup,
    SquareParking,
    Trees,
    Tv,
    User,
    UsersRound,
    Utensils,
    WashingMachine,
    Waves,
    Wheat,
    Wifi,
    Zap,
} from 'lucide-react';

// For text typed in before features and inclusions became fixed lists: the first matching pattern picks the icon.
// Order matters: "Free Bed Tea" must hit the tea rule before the bed rule, "Bathroom" before "room".
const AMENITY_ICONS = [
    [/breakfast/i, Coffee],
    [/lunch/i, Soup],
    [/dinner|full board|all meals|\bmeals?\b/i, Utensils],
    [/\btea\b|coffee/i, Coffee],
    [/drink|juice/i, GlassWater],
    [/wi-?fi|internet/i, Wifi],
    [/parking/i, SquareParking],
    [/air.?con|\ba\/?c\b/i, Snowflake],
    [/\bfans?\b/i, Fan],
    [/hot water/i, Droplets],
    [/shower|bath/i, ShowerHead],
    [/\btv\b|television/i, Tv],
    [/bbq|barbecue|campfire|bonfire/i, Flame],
    [/pool|river|stream|swim/i, Waves],
    [/bicycle|\bbikes?\b|cycling/i, Bike],
    [/transfer|pick-?up|taxi/i, Car],
    [/\bpets?\b/i, PawPrint],
    [/bird/i, Bird],
    [/veranda|balcony|terrace|sit-?out/i, Sofa],
    [/view|mountain/i, Mountain],
    [/garden|nature|forest|\btrees?\b/i, Trees],
    [/family/i, UsersRound],
    [/\bbeds?\b/i, BedDouble],
    [/cottage|room|stay|accommodation/i, House],
];

export const amenityIcon = (text = '') => AMENITY_ICONS.find(([pattern]) => pattern.test(text))?.[1] ?? Check;

// One icon per key in Cottage::FEATURES and Package::INCLUSIONS (app/Models); a key in both lists means the same thing.
const KEY_ICONS = {
    cottage: House,
    breakfast: Coffee,
    lunch: Soup,
    dinner: Utensils,
    bbq_dinner: Drumstick,
    evening_tea: Cookie,
    celebration_cake: Cake,
    campfire: Flame,
    village_tour: Wheat,
    boat_ride: Sailboat,
    late_checkout: Clock,
    welcome_drink: GlassWater,
    bed_tea: Coffee,
    wifi: Wifi,
    parking: SquareParking,
    attached_bathroom: ShowerHead,
    hot_water: Droplets,
    air_conditioning: Snowflake,
    ceiling_fan: Fan,
    mosquito_net: BugOff,
    veranda: Sofa,
    garden_view: Trees,
    mountain_view: Mountain,
    family_friendly: UsersRound,
    extra_bed: BedSingle,
    baby_cot: Baby,
    refrigerator: Refrigerator,
    tv: Tv,
    power_backup: Zap,
    laundry: WashingMachine,
    bbq: Flame,
    nature_walks: Footprints,
    bird_watching: Bird,
    bicycles: Bike,
    transfer: Car,
    non_smoking: CigaretteOff,
    pets: PawPrint,
};

/** Icon for a picked feature or inclusion ({ key, label }); older free-text entries fall back to matching their wording. */
export const featureIcon = ({ key, label }) => KEY_ICONS[key] ?? amenityIcon(label);

export const isMeal = (text = '') => /breakfast|lunch|dinner|full board|\bmeals?\b/i.test(text);

/** Dining page meals (MenuSection::MEALS) use the same icons as package inclusions. */
export const mealIcon = (key) => KEY_ICONS[key] ?? Utensils;

const SIZES = { xs: 'h-3.5 w-3.5', sm: 'h-4 w-4', md: 'h-5 w-5' };
const GAPS = { xs: 'gap-1.5', sm: 'gap-2', md: 'gap-2' };

const TONES = {
    neutral: { icon: 'text-stone-800', text: 'text-stone-700' },
    perk: { icon: 'text-leaf-600', text: 'font-medium text-forest-500' },
};

/** One icon + label line. Pass `icon` (a lucide component) or `lead` (any node, e.g. <Pax />). */
export function Amenity({ icon: Icon, lead, tone = 'neutral', size = 'sm', as: Tag = 'li', className = '', children }) {
    const t = TONES[tone];

    return (
        <Tag className={`flex items-center ${GAPS[size]} ${t.text} ${className}`}>
            {lead ?? <Icon className={`${SIZES[size]} shrink-0 ${t.icon}`} aria-hidden />}
            <span>{children}</span>
        </Tag>
    );
}

/** Occupancy as person icons, Booking.com style: one per guest, or a single icon with "×n" past `max`. */
export function Pax({ count, max = 4, size = 'sm', className = 'text-stone-800' }) {
    const n = Number(count) || 0;
    const label = `${n} guest${n === 1 ? '' : 's'}`;

    return (
        <span className={`inline-flex shrink-0 items-center ${className}`} title={label}>
            {Array.from({ length: n > max ? 1 : n }, (_, i) => (
                <User key={i} className={`${SIZES[size]} ${i ? '-ml-1' : ''}`} aria-hidden />
            ))}
            {n > max && (
                <span className="ml-0.5 text-xs font-medium" aria-hidden>
                    ×{n}
                </span>
            )}
            <span className="sr-only">{label}</span>
        </span>
    );
}
