import Card from "../components/Card/Card"
import Categories from "../components/Categories/Categories"
import FeaturedCard from "../components/FeaturedCard/FeaturedVideoCard"
import Layout from "../components/Layout"
import Select from "../components/Select/Select"
import sortByAttribute from "../helpers/sort"
import { getAllDapps } from "../hooks/getAllDapps"
import { useCategoryStore } from "../hooks/useCategoryStore"
import { useRouter } from "next/router"
import { useEffect } from "react"
import styled from "styled-components"

const StyledSection = styled.section`
  grid-template-areas:
    "list header"
    "list cards";
  grid-template-columns: minmax(300px, 340px) 1fr;
  grid-column-gap: 64px;

  .featured {
    grid-area: header;
  }

  .categories {
    grid-area: list;
  }

  .cards {
    grid-area: cards;
  }
`

const Home = ({
  dappCards,
  featuredDapp,
}: {
  dappCards: DappCard[]
  featuredDapp?: DappCard
}) => {
  const router = useRouter()
  const selectedFilters = useCategoryStore((state) => state.selectedFilters)
  const selectedSort = useCategoryStore((state) => state.selectedSort)
  const setSelectedSort = useCategoryStore((state) => state.setSelectedSort)
  useEffect(() => {
    const allFilters = selectedFilters.join(",")
    const sortBy = selectedSort
    let url = "/"
    if (allFilters.length) {
      url += `?filters=${allFilters}`
    }
    if (sortBy && sortBy.length) {
      url += `${allFilters.length ? "&" : "?"}sort=${sortBy}`
    }
    if (router.pathname !== url) {
      router.push(url)
    }
  }, [selectedFilters, selectedSort])

  const filteredDapps = dappCards.filter((dapp) => {
    return (
      selectedFilters.reduce((acc, val) => {
        if (val === "dotw" && dapp.featured) {
          acc = acc + 1
        }
        if (val === "doxxed" && !dapp.annonymous) {
          acc = acc + 1
        }
        if (val === "audited" && dapp.audits && dapp.audits.length > 0) {
          acc = acc + 1
        }
        return acc
      }, 0) === selectedFilters.length
    )
  })
  const sortedDapps = sortByAttribute(filteredDapps, selectedSort)
  return (
    <Layout>
      <div className="container px-4 mx-auto mb-16 lg:mb-32">
        <StyledSection className="lg:grid lg:mt-20">
          <FeaturedCard videoUrl="/promo.mp4" className="featured" />
          <Categories
            className="categories lg:max-w-[340px]"
            dappCards={dappCards}
          />
          <div className="cards">
            <h3 className="lg:hidden font-semibold text-xl leading-none mb-5">
              All dapps
            </h3>
            <div className="w-[164px] float-right">
              <Select
                placeholder="Sort By"
                options={[
                  { label: "A-Z", value: "A-Z" },
                  { label: "Z-A", value: "Z-A" },
                  { label: "Rating", value: "rating" },
                  { label: "New", value: "new" },
                ]}
                onChange={(sortBy) => setSelectedSort(sortBy)}
              />
            </div>
            <div className="grid grid-cols-1 w-full gap-y-8 justify-center md:grid-cols-2 lg:grid-cols-1 lg:mx-0 gap-x-8 lg:gap-y-20 xl:grid-cols-2 2xl:grid-cols-3 lg:">
              {sortedDapps.map((card) => (
                <Card key={card.url} {...card} />
              ))}
            </div>
          </div>
        </StyledSection>
      </div>
    </Layout>
  )
}

export const getStaticProps = async () => {
  const dapps = await getAllDapps()

  const parsedDapps = dapps.map((dapp: DappInfo & { url: string }) => ({
    short_description: dapp.short_description,
    title: dapp.name,
    tags: dapp.tags,
    url: dapp.url,
    logo: dapp.media.logoUrl,
    image: dapp.media.previewUrl,
    featured: dapp.dotw,
    annonymous: dapp.teamInfo.anonymous,
    audits: dapp.audits,
  }))

  return {
    props: {
      dappCards: parsedDapps,
      featuredDapp: null, //parsedDapps.filter((dapp) => dapp.featured)[0],
    },
  }
}

export default Home
