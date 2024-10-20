import { Great_Vibes, Poppins, Raleway, Noto_Sans, Kanit, Syne_Mono, Rock_Salt } from "next/font/google";

export const rockSalt = Rock_Salt({
    weight: ['400'],
    subsets: ['latin'],
    display: 'swap'
})

export const syneMono = Syne_Mono({
    weight: ['400'],
    subsets: ['latin'],
    variable: '--font-syne-mono',
    display: 'swap'
})

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