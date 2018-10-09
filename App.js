import React, { Component } from 'react';
import { AppRegistry, TouchableOpacity, Text, Image, View, StyleSheet, FlatList, ActivityIndicator} from 'react-native';
import { createStackNavigator } from 'react-navigation';
import SVGImage from 'react-native-svg-image'

const styles = StyleSheet.create({
  body: {
    flex: 1,
    backgroundColor: 'white'
  },
  header: {
    fontSize: 40,
    fontWeight: 'bold',
  },
  listItemView: {
    flex: 1,
    flexDirection: 'row',
    borderTopColor: 'white',
    borderLeftColor: 'white',
    borderRightColor: 'white',
    borderColor: 'black',
    borderWidth: 1,
    padding: 10,
  },
  listItem: {
    fontSize: 20,
    fontWeight: 'bold',
    padding: 10,
  },
  crest: {
    height: 50,
    width: 75
  },
  teamHeader: {
    flex: 1,
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center'
  },
  teamName: {
    fontSize: 30,
    fontWeight: 'bold',
    padding: 10,
  },
  teamPlayersView: {
    flex: 4,
  },
  playerJerseyNumber: {
    fontWeight: 'bold',
    fontSize: 20,
    flex:1
  },
  playerName: {
    fontSize: 20,
    flex:1
  },
  playerPosition: {
    fontSize: 20,
    color: 'grey',
    flex:1
  }
});

const APIAuthToken = '7c35bee27f7f4750b57156e65ab348f0';

class HomeScreen extends Component {

  render() {
    return (
      <View style={styles.body}>
        <FlatList
          data={[
            {key: 'Attending teams', route: 'Teams'},
            {key: 'Group Stage', route: 'Groups'}
          ]}
          renderItem={
            ({item}) => (
              <TouchableOpacity
                style={styles.listItemView}
                onPress={() => {
                  this.props.navigation.navigate(item.route)
                }}>
              <Text
                style={styles.listItem}
                >
                {item.key}
              </Text>
              </TouchableOpacity>
            )}
        />
      </View>
    );
  }
}

class TeamsScreen extends Component {

  constructor(props) {
    super(props)
    this.state = {
      isLoading: true
    }
  }

  componentDidMount() {
    let req = new Request('https://api.football-data.org/v1/competitions/467/teams', {
      method: 'GET',
      headers: {
        'X-Auth-Token': APIAuthToken
      }
    })
    return fetch(req).then(response => {
      if (response.status == 200) {
        return response.json();
      } else {
        throw new Error('Something went wrong with API server');
      }
    }).then(responseJson => {
      this.setState({
        isLoading: false,
        dataSource: responseJson.teams,
      })
    }).catch(error => {
      console.error(error)
    })
  }

  render() {
    if (this.state.isLoading) {
      return (
        <View style={{flex: 1, padding: 20}}>
          <ActivityIndicator/>
        </View>
      );
    } else {
      return (
        <View style={styles.body}>
        <FlatList
        data={this.state.dataSource}
        keyExtractor={(item => item.code)}
        renderItem={({item}) =>  {
          return (
            <TouchableOpacity
              style={styles.listItemView}
              onPress={() => {
                this.props.navigation.navigate('Team', {
                  team: item
                })
              }}
            >
            <SVGImage
              source={{uri:item.crestUrl}}
              style={styles.crest}
            />
            <Text
              style={styles.listItem}
            >
              {item.name}
            </Text>
            </TouchableOpacity>
          )
        }}
      />
        </View>
      );
    }
  }
}

class TeamScreen extends Component {

  static navigationOptions = ({navigation}) => {
    return {
      title: navigation.getParam('team', 'Team').code
    };
  };

  constructor(props) {
    super(props)
    this.state = {
      team: this.props.navigation.getParam('team', {}),
      isLoading: true
    }
  }

  componentDidMount() {
    if (this.state.team != {}) {
      let req = new Request(this.state.team._links.players.href, {
        method: 'GET',
        headers: {
          'X-Auth-Token': APIAuthToken
        }
      });
      return fetch(req).then(response => {
        if (response.status == 200) {
          return response.json();
        } else {
          throw new Error('Something went wrong with API server');
        }
      }).then(responseJson => {
        this.setState(previousState => {
          return {
            team: previousState.team,
            isLoading: false,
            players: responseJson.players,
          }
        })
      }).catch(error => {
        console.error(error)
      })
    }
  }

  render() {
    if (this.state.isLoading) {
      return (
        <View style={styles.body}>
        <View style={styles.teamHeader}>
          <SVGImage
            source={{uri: this.state.team.crestUrl}}
            style={{width:80, height:80}}
          />
          <Text style={styles.teamName}>
            {this.state.team.name}
          </Text>
        </View>
        <View style={styles.teamPlayersView}>
          <ActivityIndicator/>
        </View>
        </View>
      )
    } else {
      return (
        <View style={styles.body}>
          <View style={styles.teamHeader}>
            <SVGImage
              source={{uri: this.state.team.crestUrl}}
              style={{width:80, height:80}}
            />
            <Text style={styles.teamName}>
              {this.state.team.name}
            </Text>
          </View>
          <View style={styles.teamPlayersView}>
            <FlatList
              data={this.state.players}
              keyExtractor={(item => item.name)}
              renderItem={({item}) => {
                return (
                  <TouchableOpacity style={styles.listItemView}>
                    <Text style={styles.playerJerseyNumber}>{item.jerseyNumber}</Text>
                    <Text style={styles.playerName}>{item.name}</Text>
                    <Text style={styles.playerPosition}>{item.position}</Text>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      )
    }
  }
}

class GroupsScreen extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isLoading: true
    }
  }

  componentDidMount() {
    let req = new Request('https://api.football-data.org/v1/competitions/467/leagueTable', {
      method: 'GET',
      headers: {
        'X-Auth-Token': APIAuthToken
      }
    });
    return fetch(req).then( (response) => {
      if (response.status == 200) {
        return response.json();
      } else {
        throw new Error('Something went wrong with API.');
      }
    }).then((responseJson) => {
      this.setState({
        isLoading: false,
        dataSource: responseJson.standings,
      });
    }).catch(error => {
      console.log(error)
    });
  }

  render() {
    if (this.state.isLoading) {
      return (
        <View style={styles.body}>
          <ActivityIndicator/>
        </View>
      );
    } else {
      return (
        <View style={styles.body}>
          <FlatList
            data={[
              {key: 'A'},
              {key: 'B'},
              {key: 'C'},
              {key: 'D'},
              {key: 'E'},
              {key: 'F'},
              {key: 'G'},
              {key: 'H'}
            ]}
            keyExtractor={(item => item.key)}
            renderItem={({item}) => {
              return (
                <TouchableOpacity style={styles.listItemView}
                  onPress={() => {
                    this.props.navigation.navigate('Group', {
                      key: item.key,
                      group: this.state.dataSource[item.key]
                    })
                  }}
                >
                  <Text style={styles.listItem}>Group {item.key}</Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      );
    }
  }
}

class GroupScreen extends Component {

  static navigationOptions = ({navigation}) => {
    title: 'Group'+navigation.getParam('key', '')
  }

  constructor(props) {
    super(props)
    this.state = {
      group: this.props.navigation.getParam('group', {test:'test'})
    }
  }

  render () {‹›
    return (
      <View style={styles.body}>
        <FlatList
          data={this.state.group}
          keyExtractor={item => item.team}
          renderItem={({item}) => {
            return (
              <TouchableOpacity style={styles.listItemView}>
                <Text style={styles.listItem}> {item.rank} </Text>
                <SVGImage
                  source={{uri: item.crestURI}}
                  style={{width:80, height:80}}
                />
                <Text style={styles.listItem}> {item.team} </Text>
                <Text style={styles.listItem}> {item.points} </Text>
                <Text style={styles.listItem}> {item.goalDifference} </Text>
              </TouchableOpacity>
            )
          }}
        />
      </View>
    );
  }

}

const RootStack = createStackNavigator(
  {
    Home: {
      screen: HomeScreen,
      navigationOptions: {
        title: 'Home'
      }
    },
    Teams: {
      screen: TeamsScreen,
      navigationOptions: {
        title: 'Teams'
      }
    },
    Team: {
      screen: TeamScreen,
    },
    Groups: {
      screen: GroupsScreen,
      navigationOptions: {
        title: 'Groups'
      }
    },
    Group: {
      screen: GroupScreen,
    }
  },
  {
    initialRouteName: 'Home'
  }
);

export default class App extends React.Component {
  render() {
    return <RootStack />;
  }
}
