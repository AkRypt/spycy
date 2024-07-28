import { Great_Vibes, Poppins, Raleway, Noto_Sans, Kanit } from "next/font/google";

export const notoSans = Noto_Sans({
    weight: ['400', '600', '700'],
    subsets: ['latin'],
    variable: '--font-noto-sans',
    display: 'swap'
})

export const kanit = Kanit({
    weight: ['400', '600', '700'],
    subsets: ['latin'],
    variable: '--font-kanit',
    display: 'swap'
})

export const poppins = Poppins({
    weight: ['400', '600'],
    subsets: ['latin'],
    variable: '--font-poppins',
    display: 'swap'
})

export const raleway = Raleway({
    weight: '700',
    subsets: ['latin'],
    variable: '--font-raleway',
    display: 'swap'
})

export const greatVibes = Great_Vibes({
    weight: '400',
    subsets: ['latin'],
    variable: '--font-great-vibes',
    display: 'swap'
})