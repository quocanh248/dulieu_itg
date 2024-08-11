import axios from 'axios';

export function createUrlWithParams(
    baseUrl: string,
    params?: Record<string, string | number | boolean>
): string {
    const filteredParams = new URLSearchParams(
        Object.entries(params ?? {})
            .filter(([, value]) => value !== undefined)
            .map(([key, value]) => [key, String(value)])
    );

    return `${baseUrl}${filteredParams.toString() ? `?${filteredParams.toString()}` : ''}`;
}

export function formatNumber(
    value: number,
    locale: string = 'vi-VN',
    options?: Intl.NumberFormatOptions
): string {
    return new Intl.NumberFormat(locale, options).format(value);
}

export function formatDateTime(
    date: Date,
    formatType:
        | 'date'
        | 'time'
        | 'datetime'
        | 'date_long'
        | 'time_long'
        | 'datetime_long' = 'datetime'
): string {
    const [day, month, year] = [date.getDate(), date.getMonth() + 1, date.getFullYear()].map((n) =>
        String(n).padStart(2, '0')
    );
    const [hours, minutes, seconds] = [date.getHours(), date.getMinutes(), date.getSeconds()].map(
        (n) => String(n).padStart(2, '0')
    );
    const daysOfWeek = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    const dayOfWeek = daysOfWeek[date.getDay()];

    switch (formatType) {
        case 'date':
            return `${day}/${month}/${year}`;
        case 'time':
            return `${hours}:${minutes}:${seconds}`;
        case 'date_long':
            return `${dayOfWeek}, ${day}/${month}/${year}`;
        case 'time_long':
            return `${dayOfWeek}, ${hours}:${minutes}:${seconds}`;
        default:
            return `${dayOfWeek}, ${hours}:${minutes}:${seconds} ${day}/${month}/${year}`;
    }
}

type Network = 'Viettel' | 'Vinaphone' | 'Mobifone' | 'Vietnamobile' | 'Gmobile' | 'Unknown';

export function checkPhoneNumber(phoneNumber: string): { isValid: boolean; network: Network } {
    const cleanedNumber = phoneNumber.replace(/\D/g, '');
    const prefixes = {
        Viettel: [
            '086',
            '096',
            '097',
            '098',
            '032',
            '033',
            '034',
            '035',
            '036',
            '037',
            '038',
            '039',
        ],
        Vinaphone: ['088', '091', '094', '083', '084', '085', '081', '082'],
        Mobifone: ['089', '090', '093', '070', '079', '077', '076', '078'],
        Vietnamobile: ['092', '056', '058'],
        Gmobile: ['099', '059'],
    };

    if (cleanedNumber.length !== 10) return { isValid: false, network: 'Unknown' };

    for (const network in prefixes) {
        if (
            prefixes[network as keyof typeof prefixes].some((prefix) =>
                cleanedNumber.startsWith(prefix)
            )
        ) {
            return { isValid: true, network: network as Network };
        }
    }

    return { isValid: false, network: 'Unknown' };
}

export function createSlug(text: string): string {
    text = text.toLowerCase();

    const vietnameseDiacriticsMap: { [key: string]: string } = {
        à: 'a',
        á: 'a',
        ả: 'a',
        ã: 'a',
        ạ: 'a',
        ă: 'a',
        ằ: 'a',
        ắ: 'a',
        ẳ: 'a',
        ẵ: 'a',
        ặ: 'a',
        â: 'a',
        ầ: 'a',
        ấ: 'a',
        ẩ: 'a',
        ẫ: 'a',
        ậ: 'a',
        è: 'e',
        é: 'e',
        ẻ: 'e',
        ẽ: 'e',
        ẹ: 'e',
        ê: 'e',
        ề: 'e',
        ế: 'e',
        ể: 'e',
        ễ: 'e',
        ệ: 'e',
        ì: 'i',
        í: 'i',
        ỉ: 'i',
        ĩ: 'i',
        ị: 'i',
        ò: 'o',
        ó: 'o',
        ỏ: 'o',
        õ: 'o',
        ọ: 'o',
        ô: 'o',
        ồ: 'o',
        ố: 'o',
        ổ: 'o',
        ỗ: 'o',
        ộ: 'o',
        ơ: 'o',
        ờ: 'o',
        ớ: 'o',
        ở: 'o',
        ỡ: 'o',
        ợ: 'o',
        ù: 'u',
        ú: 'u',
        ủ: 'u',
        ũ: 'u',
        ụ: 'u',
        ư: 'u',
        ừ: 'u',
        ứ: 'u',
        ử: 'u',
        ữ: 'u',
        ự: 'u',
        ỳ: 'y',
        ý: 'y',
        ỷ: 'y',
        ỹ: 'y',
        ỵ: 'y',
        đ: 'd',
        ' ': '-',
        ',': '',
        '.': '',
        '!': '',
        '?': '',
        '(': '',
        ')': '',
        '&': '',
        ':': '',
        ';': '',
        '"': '',
        "'": '',
        '[': '',
        ']': '',
        '{': '',
        '}': '',
        '@': '',
        '#': '',
        $: '',
        '%': '',
        '^': '',
        '*': '',
        '+': '',
        '=': '',
        '/': '',
        '\\': '',
        '|': '',
        '~': '',
        '<': '',
        '>': '',
        _: '-',
    };

    text = text.replace(
        /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/g,
        (match) => vietnameseDiacriticsMap[match] || ''
    );
    text = text.replace(/[^a-z0-9-]/g, (char) => vietnameseDiacriticsMap[char] || '');
    text = text.replace(/-+/g, '-');
    text = text.replace(/^-+|-+$/g, '');
    return text;
}

export const sendAPIRequest = async (
    url: string,
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    data = {},
    token: string | null = null // Thêm tham số token
) => {
    try {
        const response = await axios({
            // baseURL: 'http://30.0.2.12:3001' + url,
            baseURL: 'http://localhost:3001' + url,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                // Authorization: `Bearer 398cd41e91f1f3309713ab3b88b55f9b`,
                Authorization: token ? `Bearer ${token}` : undefined,
            },
            data: method !== 'GET' ? data : {},
        });

        return response.data;
    } catch (error) {
        console.error('There was a problem with the axios operation:', error);
        throw error;
    }
};

export const sendImageAPIRequest = async (
    url: string,
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    data = {}
) => {
    try {
        const response = await axios({
            baseURL: url,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer 398cd41e91f1f3309713ab3b88b55f9b`,
            },
            data: method !== 'GET' ? data : {},
        });

        return response.data;
    } catch (error) {
        console.error('There was a problem with the axios operation:', error);
        throw error;
    }
};
