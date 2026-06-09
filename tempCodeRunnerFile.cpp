#include<iostream>
#include<bits/stdc++.h>
using namespace std;

struct comp {
    bool operator()(int a, int b) {
        return a > b;
    }
};

// bool comp(int a,int b){
//     return a>b;
// }
int main(){

    vector<int> arr;

    arr.push_back(2);
    arr.push_back(3);
    arr.push_back(5);

    sort(arr.begin() ,arr.end() ,comp());

    for(auto it :arr){
        cout<<it;
    }

    return 0;
}




