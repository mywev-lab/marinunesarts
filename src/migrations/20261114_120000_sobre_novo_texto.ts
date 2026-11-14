/**
 * Página Sobre: novo texto da Mariane (com três seções), em português e em inglês.
 *
 * O título continua "A arte sempre me chamou. Um dia, eu respondi." A frase em destaque, que
 * repetia "Não pinto apenas o que vejo: pinto o que sinto.", fica vazia: a frase agora está no
 * próprio texto. Para destacar outra frase, use o campo "Frase em destaque" no painel.
 */
import { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'

import { heading, inlineFromHtml, paragraph, root, type LexicalNode } from '../seed/lexical'

type Bloco = ['p' | 'h2', string]

const PT: Bloco[] = [
  ['p', 'Meu nome é Mariane Nunes, sou artista independente de São Paulo e criadora do Efúgio Atelier.'],
  ['p', 'Desde criança, a arte exerce um fascínio profundo sobre mim. Sempre me encantou a capacidade de transformar uma folha em branco em algo capaz de despertar sentimentos, memórias e novas formas de enxergar o mundo.'],
  ['p', 'Durante muito tempo, porém, acreditei que a arte não era um caminho possível para mim. Admirava pinturas e desenhos à distância, convencida de que não tinha talento suficiente para criar.'],
  ['p', 'Foi em um dos momentos mais delicados da minha vida que essa percepção começou a mudar.'],
  ['h2', 'Quando a arte se tornou meu refúgio'],
  ['p', 'Às vésperas de completar 30 anos, atravessei um período de profundas transformações. Perdi a casa onde cresci com minha família, enfrentei dificuldades emocionais e financeiras e precisei reconstruir minha trajetória profissional.'],
  ['p', 'Em meio a tantas incertezas, enquanto me adaptava a uma nova casa e iniciava uma transição de carreira da educação para o marketing, encontrei na arte um lugar de acolhimento.'],
  ['p', 'Comecei a experimentar o giz pastel oleoso, encantada com a intensidade das cores, as texturas e a liberdade de criar sem buscar a perfeição. Depois, descobri a delicadeza e a imprevisibilidade da aquarela.'],
  ['p', 'Aos poucos, entre pincéis, pigmentos e folhas de papel, fui descobrindo uma nova maneira de habitar o mundo — e a mim mesma.'],
  ['p', 'O que começou como uma forma de encontrar serenidade tornou-se uma paixão, uma linguagem e uma parte essencial de quem sou.'],
  ['h2', 'O significado por trás das minhas obras'],
  ['p', 'Gosto de pintar casas, jardins, paisagens naturais e pessoas em momentos de contemplação. Hoje, percebo o quanto esses elementos dialogam com minha própria história.'],
  ['p', 'As casas representam o acolhimento e o sentimento de pertencimento. A natureza traduz minha busca por liberdade, tranquilidade e conexão com aquilo que é essencial. Já as figuras humanas carregam a delicadeza dos sentimentos e dos momentos de introspecção.'],
  ['p', 'Encontro inspiração na luz, nas cores e no movimento das obras de Monet, Degas e Van Gogh, assim como na beleza silenciosa das pequenas coisas que nos cercam.'],
  ['p', 'Não busco reproduzir a realidade com perfeição. Busco traduzir aquilo que ela me faz sentir.'],
  ['p', 'Não pinto apenas o que vejo: pinto o que sinto.'],
  ['h2', 'O nascimento do Efúgio Atelier'],
  ['p', 'O Efúgio Atelier nasce do desejo de compartilhar com outras pessoas aquilo que a arte me proporcionou: um espaço de acolhimento, liberdade e contemplação.'],
  ['p', 'Hoje, com uma trajetória profissional mais madura no marketing, decidi abrir espaço para uma nova possibilidade: levar minhas criações para além das paredes da minha casa e permitir que elas encontrem novos lares, novos olhares e novos significados.'],
  ['p', 'Por meio de obras originais, impressões artísticas e produtos digitais, quero aproximar a arte da vida cotidiana.'],
  ['p', 'Mais do que decorar ambientes, desejo que minhas criações despertem sentimentos, evoquem memórias e ofereçam pequenos instantes de serenidade em um mundo que tantas vezes nos pede pressa.'],
  ['p', 'Porque acredito que todos nós precisamos de um refúgio. E, às vezes, ele pode ser encontrado nas cores de uma pintura.'],
]

const EN: Bloco[] = [
  ['p', 'My name is Mariane Nunes. I am an independent artist from São Paulo and the creator of Efúgio Atelier.'],
  ['p', 'Ever since I was a child, art has held a deep fascination for me. I have always been enchanted by the ability to turn a blank sheet into something that can awaken feelings, memories and new ways of seeing the world.'],
  ['p', 'For a long time, though, I believed art was not a possible path for me. I admired paintings and drawings from a distance, convinced I did not have enough talent to create.'],
  ['p', 'It was during one of the most delicate moments of my life that this perception began to change.'],
  ['h2', 'When art became my refuge'],
  ['p', 'On the eve of turning 30, I went through a period of profound change. I lost the house where I grew up with my family, faced emotional and financial difficulties and had to rebuild my professional path.'],
  ['p', 'Amid so much uncertainty, while I was adjusting to a new home and starting a career change from education to marketing, I found in art a place of comfort.'],
  ['p', 'I began experimenting with oil pastel, enchanted by the intensity of the colors, the textures and the freedom to create without chasing perfection. Then I discovered the delicacy and unpredictability of watercolor.'],
  ['p', 'Little by little, among brushes, pigments and sheets of paper, I discovered a new way of inhabiting the world — and myself.'],
  ['p', 'What began as a way to find serenity became a passion, a language and an essential part of who I am.'],
  ['h2', 'The meaning behind my work'],
  ['p', 'I like to paint houses, gardens, natural landscapes and people in moments of contemplation. Today, I realize how much these elements speak to my own story.'],
  ['p', 'The houses represent comfort and a sense of belonging. Nature expresses my search for freedom, tranquility and connection with what is essential. And the human figures carry the delicacy of feelings and moments of introspection.'],
  ['p', 'I find inspiration in the light, color and movement of the works of Monet, Degas and Van Gogh, as well as in the quiet beauty of the small things around us.'],
  ['p', 'I do not try to reproduce reality perfectly. I try to translate what it makes me feel.'],
  ['p', 'I do not paint only what I see: I paint what I feel.'],
  ['h2', 'The birth of Efúgio Atelier'],
  ['p', 'Efúgio Atelier was born from the wish to share with others what art has given me: a space of comfort, freedom and contemplation.'],
  ['p', 'Today, with a more mature career in marketing, I decided to make room for a new possibility: to take my creations beyond the walls of my home and let them find new homes, new eyes and new meanings.'],
  ['p', 'Through original works, art prints and digital products, I want to bring art closer to everyday life.'],
  ['p', 'More than decorating spaces, I want my creations to awaken feelings, evoke memories and offer small moments of serenity in a world that so often asks us to hurry.'],
  ['p', 'Because I believe we all need a refuge. And sometimes, it can be found in the colors of a painting.'],
]

const toLexical = (blocos: Bloco[]) =>
  root(blocos.map(([tag, text]): LexicalNode => (tag === 'h2' ? heading('h2', inlineFromHtml(text)) : paragraph(inlineFromHtml(text)))))

const META = new Set(['id', 'createdAt', 'updatedAt', 'globalType'])
const strip = (doc: any) => Object.fromEntries(Object.entries(doc).filter(([k]) => !META.has(k)))

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  const ctx = { disableRevalidate: true }
  for (const [locale, blocos] of [
    ['pt', PT],
    ['en', EN],
  ] as const) {
    const atual: any = await payload.findGlobal({ slug: 'sobre', locale, fallbackLocale: false, depth: 0, req })
    if (!atual?.updatedAt) continue // banco novo, ainda sem conteúdo
    await payload.updateGlobal({
      slug: 'sobre',
      locale,
      data: { ...strip(atual), body: toLexical(blocos), pullQuote: null },
      depth: 0,
      req,
      context: ctx,
    })
    payload.logger.info(`Página Sobre: texto novo (${locale})`)
  }
}

export async function down(_: MigrateDownArgs): Promise<void> {
  // o texto anterior fica no histórico do Git (migrações 20261108_220000 e 20261112_160000); nada a desfazer aqui
}
