import React from 'react'
import { Button, View } from 'react-native'
import 'spectre.css/dist/spectre.min.css'
import 'spectre.css/dist/spectre-icons.min.css'
import 'spectre.css/dist/spectre-exp.min.css'
import Layout from './Layout'
import Heading from './Heading'
import { withRouter } from 'react-router-dom'
import API from './api'
import PropTypes from 'prop-types'

class ProductPage extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      loading: true,
      product: {
        id: props.match.params.id
      }
    }
  }

  componentDidMount() {
    API.getProduct(this.state.product.id)
      .then((r) => {
        this.setState({
          loading: false,
          product: r
        })
      })
      .catch((e) => {
        console.error('failed to load product ' + this.state.product.id, e)
        this.props.history.push({
          pathname: '/error',
          state: {
            error: e.toString()
          }
        })
      })
  }

  render() {
    const productInfo = (
      <div>
        <p className="product-id">ID: {this.state.product.id}</p>
        <p className="product-name">Name: {this.state.product.name}</p>
        <p className="product-type">Type: {this.state.product.type}</p>
        <p className="product-price">Price: {this.state.product.price}</p>
      </div>
    )

    return (
      <Layout>
        <Heading text="Products" href="/" />
        {this.state.loading ? (
          <div
            style={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            className="loading loading-lg"
          />
        ) : (
          productInfo
        )}
      </Layout>
    )
  }
}

ProductPage.propTypes = {
  match: PropTypes.array.isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired
}

export default withRouter(ProductPage)
